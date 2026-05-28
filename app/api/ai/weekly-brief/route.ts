import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

function getISOWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: planRow } = await admin.from('etablissements').select('plan').eq('user_id', user.id).single()
  const plan = planRow?.plan ?? user.user_metadata?.plan ?? 'free'
  if (plan !== 'pro' && plan !== 'team') {
    return NextResponse.json({ error: 'Réservé aux abonnés Pro' }, { status: 403 })
  }

  const semaine = getISOWeek(new Date())
  const annee = new Date().getFullYear()

  const [{ data: profil }, { data: indicateurs }, { data: signaux }] = await Promise.all([
    admin.from('etablissements').select('type_etablissement, region, couverts_par_jour, vol_cafe, vol_viandes, vol_laitiers, vol_farine, vol_huiles, vol_energie').eq('user_id', user.id).single(),
    admin.from('indicateurs').select('nom, valeur, unite, variation_pct, categorie').eq('semaine', semaine).eq('annee', annee).order('variation_pct', { ascending: false }),
    admin.from('signaux_geopolitiques').select('titre, description, impact, horizon, produits_lies').order('fetched_at', { ascending: false }).limit(3),
  ])

  const volumes = [
    profil?.vol_cafe     ? `café ${profil.vol_cafe} kg`          : null,
    profil?.vol_viandes  ? `viandes ${profil.vol_viandes} kg`    : null,
    profil?.vol_laitiers ? `laitiers ${profil.vol_laitiers} kg`  : null,
    profil?.vol_farine   ? `farine ${profil.vol_farine} kg`      : null,
    profil?.vol_huiles   ? `huiles ${profil.vol_huiles} L`       : null,
    profil?.vol_energie  ? `énergie ${profil.vol_energie} kWh`   : null,
  ].filter(Boolean).join(', ')

  const indText = (indicateurs || []).map(i =>
    `${i.nom} : ${i.valeur} ${i.unite} (${i.variation_pct > 0 ? '+' : ''}${i.variation_pct.toFixed(1)}%)`
  ).join('\n')

  const sigText = (signaux || []).map(s =>
    `• ${s.titre} — impact ${s.impact}, horizon ${s.horizon}`
  ).join('\n')

  const prompt = `Tu es un conseiller opérationnel pour les professionnels CHR en France.

ÉTABLISSEMENT :
- Type : ${profil?.type_etablissement || 'Restaurant'}
- Région : ${profil?.region || 'France'}
${profil?.couverts_par_jour ? `- Couverts/jour : ${profil.couverts_par_jour}` : ''}
${volumes ? `- Volumes mensuels : ${volumes}` : ''}

INDICATEURS MARCHÉ — SEMAINE ${semaine}/${annee} :
${indText || 'Aucune donnée disponible cette semaine.'}

SIGNAUX GÉOPOLITIQUES RÉCENTS :
${sigText || 'Aucun signal notable.'}

Rédige un brief opérationnel court et concret en 3 sections :

**Situation cette semaine**
2-3 phrases sur l'essentiel du marché, chiffrées.

**Vos actions prioritaires**
2-3 conseils très concrets adaptés aux volumes et au type d'établissement. Sois direct, pas de généralités.

**À surveiller dans les 4 semaines**
1-2 points d'anticipation basés sur les signaux géopolitiques ou tendances de fond.

Style : professionnel, direct, sans jargon inutile. Pas de bullet points, des phrases courtes.`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await res.json()
  const brief: string = data.content?.[0]?.text || ''

  return NextResponse.json({ brief, semaine, annee })
}
