import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendLoopsEvent } from '@/lib/loops'
import { newsletterToken } from '@/app/newsletter/[slug]/page'

function getISOWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
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

  // 1. Fetch les 5 indicateurs les plus significatifs de la semaine
  const { data: indicateurs } = await supabase
    .from('indicateurs')
    .select('nom, valeur, unite, variation_pct, categorie, source')
    .eq('semaine', semaine)
    .eq('annee', annee)
    .order('variation_pct', { ascending: false })
    .limit(5)

  // 2. Fetch les signaux géopolitiques récents
  const { data: signaux } = await supabase
    .from('signaux_geopolitiques')
    .select('titre, description, zone, impact, horizon')
    .order('fetched_at', { ascending: false })
    .limit(3)

  // 3. Fetch tous les utilisateurs
  const { data: { users } } = await supabase.auth.admin.listUsers()

  let sent = 0
  const errors: string[] = []

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://horeca.watch'
  const token = newsletterToken(annee, semaine)
  const newsletterUrl = `${appUrl}/newsletter/${annee}-S${semaine}-${token}`

  const topIndicateurs = (indicateurs || []).slice(0, 5).map(i => ({
    nom: i.nom,
    valeur: `${i.valeur.toLocaleString('fr-FR')} ${i.unite}`,
    variation: `${i.variation_pct > 0 ? '+' : ''}${i.variation_pct.toFixed(1)}%`,
    direction: i.variation_pct > 0 ? 'hausse' : i.variation_pct < 0 ? 'baisse' : 'stable',
  }))

  const topSignaux = (signaux || []).slice(0, 2).map(s => ({
    titre: s.titre,
    description: s.description,
    zone: s.zone,
    horizon: s.horizon,
  }))

  for (const user of users || []) {
    if (!user.email) continue

    const loopsRes = await sendLoopsEvent(user.email, 'newsletter_weekly', {
      semaine,
      annee,
      newsletterUrl,
      buttonLabel: 'Voir les variations de la semaine',
      indicateurs: JSON.stringify(topIndicateurs),
      signaux: JSON.stringify(topSignaux),
    })

    if (loopsRes.success !== false) { sent++ } else { errors.push(user.email) }
  }

  return NextResponse.json({ ok: true, sent, errors: errors.length ? errors : undefined })
}

function buildNewsletterHtml({ indicateurs, signaux, impactBlock, semaine, annee }: {
  indicateurs: { nom: string; valeur: number; unite: string; variation_pct: number; source: string }[]
  signaux: { titre: string; description: string; zone: string; impact: string; horizon: string }[]
  impactBlock: string
  semaine: number
  annee: number
}) {
  const rows = indicateurs.map(i => {
    const up = i.variation_pct > 0
    const color = up ? '#A32D2D' : i.variation_pct < 0 ? '#3B6D11' : '#534AB7'
    const arrow = up ? '↑' : i.variation_pct < 0 ? '↓' : '='
    return `<tr>
      <td style="padding:8px 0;border-bottom:0.5px solid #EEEDFE;font-size:13px;color:#26215C;">${i.nom}</td>
      <td style="padding:8px 0;border-bottom:0.5px solid #EEEDFE;font-size:13px;color:#26215C;font-weight:500;">${i.valeur.toLocaleString('fr-FR')} ${i.unite}</td>
      <td style="padding:8px 0;border-bottom:0.5px solid #EEEDFE;font-size:12px;color:${color};">${arrow} ${i.variation_pct > 0 ? '+' : ''}${i.variation_pct.toFixed(1)}%</td>
    </tr>`
  }).join('')

  const signalItems = signaux.map(s =>
    `<div style="background:#F0EFF9;border-radius:8px;padding:12px;margin-bottom:8px;">
      <div style="font-size:13px;font-weight:500;color:#26215C;">${s.titre}</div>
      <div style="font-size:12px;color:#534AB7;margin-top:4px;">${s.description}</div>
    </div>`
  ).join('')

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F8F8FC;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:#26215C;border-radius:12px;padding:24px;margin-bottom:16px;">
      <div style="font-size:20px;font-weight:500;color:#fff;">HoReCa<span style="color:#AFA9EC">.</span>Watch</div>
      <div style="font-size:12px;color:#AFA9EC;margin-top:4px;">Veille marché CHR · Semaine ${semaine}, ${annee}</div>
    </div>
    <div style="background:#fff;border:0.5px solid #CECBF6;border-radius:12px;padding:20px;margin-bottom:12px;">
      <div style="font-size:14px;font-weight:500;color:#26215C;margin-bottom:12px;">5 indicateurs clés de la semaine</div>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
      ${impactBlock}
    </div>
    ${signalItems ? `<div style="background:#fff;border:0.5px solid #CECBF6;border-radius:12px;padding:20px;margin-bottom:12px;"><div style="font-size:14px;font-weight:500;color:#26215C;margin-bottom:12px;">Signaux géopolitiques</div>${signalItems}</div>` : ''}
    <div style="text-align:center;padding:16px;font-size:11px;color:#888780;">
      <a href="https://horeca.watch/dashboard" style="color:#534AB7;">Voir le dashboard complet</a> ·
      <a href="https://horeca.watch/unsubscribe" style="color:#888780;">Se désabonner</a>
    </div>
  </div></body></html>`
}
