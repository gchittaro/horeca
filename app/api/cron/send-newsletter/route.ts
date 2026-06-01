import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendLoopsTransactional, LOOPS_TX } from '@/lib/loops'
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

  if (!LOOPS_TX.NEWSLETTER_WEEKLY) {
    return NextResponse.json({ error: 'LOOPS_TX_NEWSLETTER_WEEKLY manquant' }, { status: 500 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const semaine = getISOWeek(new Date())
  const annee = new Date().getFullYear()

  const { data: indicateurs } = await supabase
    .from('indicateurs')
    .select('nom, valeur, unite, variation_pct, categorie, source')
    .eq('semaine', semaine)
    .eq('annee', annee)
    .order('variation_pct', { ascending: false })
    .limit(5)

  const { data: signaux } = await supabase
    .from('signaux_geopolitiques')
    .select('titre, description, zone, impact, horizon')
    .order('fetched_at', { ascending: false })
    .limit(3)

  const { data: { users } } = await supabase.auth.admin.listUsers()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://horeca.watch'
  const token = newsletterToken(annee, semaine)
  const newsletterUrl = `${appUrl}/newsletter/${annee}-S${semaine}-${token}`

  const inds = (indicateurs || []).slice(0, 5)
  const indVars: Record<string, string> = {}
  for (let i = 0; i < 5; i++) {
    const ind = inds[i]
    const n = i + 1
    indVars[`ind${n}_nom`]       = ind?.nom ?? ''
    indVars[`ind${n}_valeur`]    = ind ? `${Number(ind.valeur).toLocaleString('fr-FR')} ${ind.unite}` : ''
    indVars[`ind${n}_variation`] = ind ? `${ind.variation_pct > 0 ? '+' : ''}${Number(ind.variation_pct).toFixed(1)}%` : ''
    indVars[`ind${n}_couleur`]   = ind ? (ind.variation_pct > 0 ? '#A32D2D' : ind.variation_pct < 0 ? '#3B6D11' : '#534AB7') : '#888780'
    indVars[`ind${n}_fleche`]    = ind ? (ind.variation_pct > 0 ? '↑' : ind.variation_pct < 0 ? '↓' : '=') : ''
  }

  const sig1 = signaux?.[0]
  const sig2 = signaux?.[1]

  const dataVariables = {
    semaine: String(semaine),
    annee:   String(annee),
    newsletterUrl,
    ...indVars,
    sig1_titre:       sig1?.titre       ?? '',
    sig1_description: sig1?.description ?? '',
    sig1_horizon:     sig1?.horizon     ?? '',
    sig2_titre:       sig2?.titre       ?? '',
    sig2_description: sig2?.description ?? '',
    sig2_horizon:     sig2?.horizon     ?? '',
  }

  let sent = 0
  const errors: string[] = []

  for (const user of users || []) {
    if (!user.email) continue
    const res = await sendLoopsTransactional(user.email, LOOPS_TX.NEWSLETTER_WEEKLY, dataVariables)
    if (res?.success !== false) { sent++ } else { errors.push(user.email) }
  }

  return NextResponse.json({ ok: true, sent, errors: errors.length ? errors : undefined })
}
