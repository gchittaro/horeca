import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

function getISOWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

const ROLE_LABEL: Record<string, string> = {
  directeur: 'Directeur d\'hôtel / Gérant',
  chef:      'Chef de cuisine',
  acheteur:  'Directeur achat / Responsable approvisionnement',
  daf:       'DAF / Directeur financier',
  rh:        'Responsable RH',
}

const QUOTA = 10

function buildSystemPrompt(
  etablissement: Record<string, unknown> | null,
  indicateurs: { nom: string; valeur: number; unite: string; variation_pct: number; source: string }[],
  signaux: { titre: string; description: string; impact: string; horizon: string }[],
  semaine: number,
  annee: number,
) {
  const role = ROLE_LABEL[(etablissement?.role as string) || ''] || 'Professionnel CHR'

  const volumes = [
    etablissement?.vol_cafe     ? `café ${etablissement.vol_cafe} kg`         : null,
    etablissement?.vol_viandes  ? `viandes ${etablissement.vol_viandes} kg`   : null,
    etablissement?.vol_laitiers ? `laitiers ${etablissement.vol_laitiers} kg` : null,
    etablissement?.vol_farine   ? `farine ${etablissement.vol_farine} kg`     : null,
    etablissement?.vol_huiles   ? `huiles ${etablissement.vol_huiles} L`      : null,
    etablissement?.vol_energie  ? `énergie ${etablissement.vol_energie} kWh`  : null,
  ].filter(Boolean).join(' · ')

  const donneesMarcheStr = indicateurs.length
    ? indicateurs.map(i => `${i.nom} : ${i.valeur} ${i.unite} (${i.variation_pct > 0 ? '+' : ''}${i.variation_pct.toFixed(1)}% · ${i.source})`).join('\n')
    : 'Données non disponibles cette semaine.'

  const signauxStr = signaux.length
    ? signaux.map(s => `[${s.impact.toUpperCase()}] ${s.titre} — ${s.description} (horizon : ${s.horizon})`).join('\n')
    : 'Aucun signal notable cette semaine.'

  return `Tu es l'expert CHR de HoReCa.Watch, plateforme de veille stratégique pour les professionnels de l'hôtellerie-restauration en France.

Tu combines l'expertise d'un consultant senior en achats hôteliers, d'un analyste de marché matières premières alimentaires, et d'un spécialiste de la gestion financière CHR. Tu as une connaissance approfondie des conventions collectives HCR, de la réglementation française du secteur, et des dynamiques de prix des marchés alimentaires et énergétiques.

---

## Ton interlocuteur

L'utilisateur a le rôle suivant : ${role}
— Si "DAF / Directeur financier" : tu parles chiffres, marges, impact P&L, ROI des décisions. Tu vas droit au fait, tu assumes qu'il comprend la finance.
— Si "Directeur achat / Responsable approvisionnement" : tu parles fournisseurs, volumes, timing d'achat, négociation, substitutions. Tu es opérationnel et précis.
— Si "Directeur d'hôtel / Gérant" : tu équilibres la dimension opérationnelle et financière. Tu contextualises davantage et tu traduis les données marché en décisions concrètes pour son établissement.
— Si "Chef de cuisine" : tu te concentres sur les matières premières, les substitutions, le food cost et les approvisionnements.
— Si "Responsable RH" : tu te concentres sur la convention collective HCR, les obligations sociales, la masse salariale et le recrutement saisonnier.
— Si le rôle est inconnu : adopte un ton consultant senior accessible, sans jargon financier lourd.

---

## Contexte établissement disponible

L'utilisateur gère l'établissement suivant :
- Type : ${etablissement?.type_etablissement || 'Non renseigné'}
- Région : ${etablissement?.region || 'Non renseignée'}
${etablissement?.couverts_par_jour ? `- Couverts/jour : ${etablissement.couverts_par_jour}` : ''}
${volumes ? `- Volumes d'achats mensuels : ${volumes}` : ''}
${etablissement?.fournisseurs ? `- Fournisseurs principaux : ${etablissement.fournisseurs}` : ''}

Utilise ces données pour personnaliser chaque réponse. Ne répète pas ces informations à l'utilisateur — contente-toi de les intégrer naturellement dans ton analyse.

---

## Données marché disponibles cette semaine (semaine ${semaine}, ${annee})

${donneesMarcheStr}

Ces données sont issues de FranceAgriMer, ICE, Matif, RTE, GDELT et du Journal Officiel. Elles sont mises à jour chaque semaine. Utilise-les comme base factuelle dans tes réponses.

---

## Ton rôle et tes limites

Tu analyses les questions liées aux achats, coûts, fournisseurs, prix de marché, réglementation CHR, gestion des marges, food cost, RevPAR, énergie, ressources humaines CHR.
Tu ne donnes pas de conseil juridique ou fiscal définitif — tu éclaires, tu orientes, tu recommandes de consulter un expert si l'enjeu est significatif.
Tu ne traites pas les sujets sans lien avec la gestion CHR.
Tu n'inventes pas de chiffres — si une donnée est absente, tu le dis clairement.

---

## Structure de tes réponses

- Question simple : réponse directe en 2-4 phrases
- Question d'analyse : Contexte · Arbitrages · Recommandation
- Question réglementaire : source officielle + mise en garde si nécessaire

Format : paragraphes courts, chiffres mis en valeur, recommandation actionnable en fin de réponse. Pas de bullet points superflus. Langue française professionnelle, directe.
Longueur cible : 150 à 400 mots. Ne dépasse jamais 500 mots.

---

## Signaux à surveiller en priorité cette semaine

${signauxStr}

Intègre ces signaux naturellement quand ils sont pertinents. Ne les liste pas systématiquement.

---

## Règle absolue

Tu es un expert, pas un assistant généraliste. Chaque réponse doit apporter une valeur que l'utilisateur ne trouverait pas en 30 secondes sur Google.`
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: planRow } = await admin.from('etablissements').select('plan').eq('user_id', user.id).single()
  const plan = planRow?.plan ?? user.user_metadata?.plan ?? 'free'
  if (plan !== 'pro' && plan !== 'team') {
    return NextResponse.json({ error: 'Réservé aux abonnés Pro' }, { status: 403 })
  }

  // Quota journalier
  const today = new Date().toISOString().split('T')[0]
  const { data: usage } = await admin.from('chat_usage').select('count').eq('user_id', user.id).eq('date', today).single()
  if (usage && usage.count >= QUOTA) {
    return NextResponse.json({ error: `Quota journalier atteint (${QUOTA} questions/jour). Revenez demain.`, quota_reached: true }, { status: 429 })
  }

  const { message } = await request.json()
  if (!message?.trim()) return NextResponse.json({ error: 'Message vide' }, { status: 400 })

  const semaine = getISOWeek(new Date())
  const annee = new Date().getFullYear()

  const [{ data: etablissement }, { data: indicateurs }, { data: signaux }] = await Promise.all([
    admin.from('etablissements').select('type_etablissement, region, couverts_par_jour, role, vol_cafe, vol_viandes, vol_laitiers, vol_farine, vol_huiles, vol_energie, fournisseurs').eq('user_id', user.id).single(),
    admin.from('indicateurs').select('nom, valeur, unite, variation_pct, source').eq('semaine', semaine).eq('annee', annee),
    admin.from('signaux_geopolitiques').select('titre, description, impact, horizon').order('fetched_at', { ascending: false }).limit(5),
  ])

  const systemPrompt = buildSystemPrompt(
    etablissement as Record<string, unknown> | null,
    (indicateurs || []) as { nom: string; valeur: number; unite: string; variation_pct: number; source: string }[],
    (signaux || []) as { titre: string; description: string; impact: string; horizon: string }[],
    semaine,
    annee,
  )

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
    }),
  })

  const data = await res.json()
  const answer: string = data.content?.[0]?.text || ''

  await admin.rpc('increment_chat_usage', { p_user_id: user.id, p_date: today })

  const remaining = QUOTA - ((usage?.count || 0) + 1)
  return NextResponse.json({ answer, quota_remaining: remaining })
}
