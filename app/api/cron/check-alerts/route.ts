import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendLoopsTransactional, LOOPS_TX } from '@/lib/loops'

function getISOWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

const mapping: Record<string, string> = {
  'Café arabica':     'vol_cafe',
  'Bœuf haché 15%':  'vol_viandes',
  'Lait entier':      'vol_laitiers',
  'Farine T55':       'vol_farine',
  'Huile tournesol':  'vol_huiles',
  'Électricité spot': 'vol_energie',
}

export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const semaine = getISOWeek(new Date())
  const annee = new Date().getFullYear()

  const { data: indicateurs } = await supabase
    .from('indicateurs')
    .select('nom, variation_pct, categorie')
    .eq('semaine', semaine)
    .eq('annee', annee)

  const { data: signaux } = await supabase
    .from('signaux_geopolitiques')
    .select('titre, produits_lies, impact, horizon')
    .gte('fetched_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const { data: profils } = await supabase
    .from('etablissements')
    .select('user_id, vol_cafe, vol_viandes, vol_laitiers, vol_farine, vol_huiles, vol_energie, seuil_alerte_euros, alert_surcout, alert_geopolitique, alert_reglementation')

  let alertsSent = 0

  for (const profil of profils || []) {
    const { data: { user } } = await supabase.auth.admin.getUserById(profil.user_id)
    if (!user?.email) continue

    const plan = user.user_metadata?.plan || 'free'
    if (plan !== 'pro' && plan !== 'team') continue

    const alertEmails: { eventName: string; properties: Record<string, unknown> }[] = []

    // Calcul surcoût
    if (profil.alert_surcout && indicateurs) {
      const totalImpact = indicateurs.reduce((sum: number, ind: { nom: string; variation_pct: number }) => {
        const volKey = mapping[ind.nom] as keyof typeof profil
        const vol = (profil[volKey] as number) || 0
        return sum + Math.round(vol * ind.variation_pct / 100)
      }, 0)

      const seuil = profil.seuil_alerte_euros || 200
      if (totalImpact > seuil) {
        alertEmails.push({
          eventName: 'alert_cost',
          properties: {
            impactEstime: `+${totalImpact} €`,
            seuilEuros: seuil,
            semaine,
            annee,
            dashboardUrl: 'https://horeca.watch/profil',
          },
        })
      }
    }

    // Signaux géopolitiques sur produits achetés
    if (profil.alert_geopolitique && signaux) {
      const produitsCHR = Object.entries(mapping)
        .filter(([, volKey]) => (profil[volKey as keyof typeof profil] as number) > 0)
        .map(([nom]) => nom.toLowerCase())

      for (const signal of signaux) {
        const produits = (signal.produits_lies as string[]) || []
        const match = produits.some((p: string) =>
          produitsCHR.some(pc => pc.includes(p.toLowerCase()) || p.toLowerCase().includes(pc.split(' ')[0]))
        )
        if (match && signal.impact === 'hausse') {
          alertEmails.push({
            eventName: 'alert_geopolitical',
            properties: {
              titrSignal: signal.titre,
              produitsLies: produits.join(', '),
              horizon: signal.horizon,
              dashboardUrl: 'https://horeca.watch/dashboard/geopolitique',
            },
          })
        }
      }
    }

    // Envoyer les alertes via Loops transactional
    for (const alert of alertEmails) {
      const txId = alert.eventName === 'alert_cost' ? LOOPS_TX.ALERT_COST : LOOPS_TX.ALERT_GEO
      if (txId) {
        await sendLoopsTransactional(user.email!, txId, alert.properties).catch(() => {})
        alertsSent++
      }
    }
  }

  return NextResponse.json({ ok: true, alertsSent })
}
