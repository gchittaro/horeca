import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SEMAINE = getISOWeek(new Date())
const ANNEE   = new Date().getFullYear()

function getISOWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

function buildSystemPrompt() {
  return `Tu es l'analyste de marché de HoReCa.Watch, une plateforme de veille stratégique pour les professionnels de l'hôtellerie-restauration en France (CHR).

Ton rôle est de collecter, analyser et structurer les données de marché chaque semaine à partir de sources publiques fiables.

## Règles absolues
1. Ne jamais inventer un chiffre. Si une donnée est absente, mettre "valeur": null.
2. Toujours citer la source exacte.
3. Les variations sont en pourcentage par rapport à la semaine ou au mois précédent.
4. Pour les signaux géopolitiques : ne signaler que ce qui a un impact direct probable sur les approvisionnements CHR en France dans les 4 à 8 semaines.
5. Pour la réglementation : ne retenir que les textes applicables en France.
6. Niveau de langue : professionnel, factuel, sans sensationnalisme.

## Format de sortie
Retourne UNIQUEMENT un JSON valide, sans texte avant ni après, sans backticks markdown.`
}

function buildUserPrompt(rawData: Record<string, string>, previousWeekData: string) {
  const semaine = getISOWeek(new Date())
  return `Voici les données brutes collectées cette semaine depuis les sources publiques de HoReCa.Watch.

## Données FranceAgriMer (semaine ${semaine})
${rawData.franceagrimer || 'Non disponible'}

## Données RTE / EPEX — Énergie
${rawData.energie || 'Non disponible'}

## Flux RSS — L'Hôtellerie Restauration
${rawData.rss_chr || 'Non disponible'}

## Flux RSS — Journal Officiel / Légifrance
${rawData.jo || 'Non disponible'}

## Données GDELT — Signaux géopolitiques
${rawData.gdelt || 'Non disponible'}

## Contexte semaine précédente (pour calculer les variations)
${previousWeekData || 'Première collecte — pas de référence précédente'}

Analyse ces données et retourne le JSON structuré. Ne retourne que le JSON.`
}

async function fetchFranceAgriMer(): Promise<string> {
  try {
    const res = await fetch('https://www.data.gouv.fr/api/1/datasets/?organization=5756b718a3a7292534b8de07&page_size=5', { next: { revalidate: 0 } })
    const data = await res.json()
    return JSON.stringify(data?.data?.slice(0, 3) || [])
  } catch { return 'Erreur fetch FranceAgriMer' }
}

async function fetchGDELT(): Promise<string> {
  try {
    const keywords = encodeURIComponent('cacao OR café OR blé OR "huile tournesol" OR "Mer Rouge" shipping food commodity')
    const res = await fetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${keywords}&mode=artlist&maxrecords=10&format=json`, { next: { revalidate: 0 } })
    const data = await res.json()
    return JSON.stringify(data?.articles?.slice(0, 5) || [])
  } catch { return 'Erreur fetch GDELT' }
}

async function fetchJO(): Promise<string> {
  try {
    const res = await fetch('https://www.legifrance.gouv.fr/rss/jorf.xml', { next: { revalidate: 0 } })
    const text = await res.text()
    return text.slice(0, 3000)
  } catch { return 'Erreur fetch JO' }
}

async function fetchRSSCHR(): Promise<string> {
  try {
    const res = await fetch('https://www.lhotellerie-restauration.fr/rss.xml', { next: { revalidate: 0 } })
    const text = await res.text()
    return text.slice(0, 3000)
  } catch { return 'Erreur fetch L\'Hôtellerie Restauration' }
}

export async function GET(request: Request) {
  // Vérifie le token secret pour sécuriser l'endpoint
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Fetch toutes les sources en parallèle
  const [franceagrimer, gdelt, jo, rss_chr] = await Promise.all([
    fetchFranceAgriMer(),
    fetchGDELT(),
    fetchJO(),
    fetchRSSCHR(),
  ])

  // 2. Récupérer les données de la semaine précédente
  const { data: prevWeek } = await supabase
    .from('indicateurs')
    .select('nom, valeur, variation_pct, source')
    .eq('semaine', SEMAINE - 1)
    .eq('annee', ANNEE)

  // 3. Appel Claude API pour synthèse
  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: buildSystemPrompt(),
      messages: [{
        role: 'user',
        content: buildUserPrompt({ franceagrimer, gdelt, jo, rss_chr }, JSON.stringify(prevWeek || [])),
      }],
    }),
  })

  const claudeData = await claudeRes.json()
  const text: string = claudeData.content?.[0]?.text || ''

  // 4. Parser le JSON Claude
  let parsed: {
    indicateurs?: unknown[]
    signaux_geopolitiques?: unknown[]
    alertes_reglementation?: unknown[]
    alertes_rh?: unknown[]
  }
  try {
    parsed = JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) {
      console.error('[cron/fetch-data] Impossible de parser la réponse Claude:', text)
      return NextResponse.json({ error: 'Parse error', raw: text }, { status: 500 })
    }
    parsed = JSON.parse(match[0])
  }

  // 5. Insérer dans Supabase
  const results: Record<string, unknown> = {}

  if (parsed.indicateurs?.length) {
    const rows = (parsed.indicateurs as Record<string, unknown>[]).map(i => ({ ...i, semaine: SEMAINE, annee: ANNEE, fetched_at: new Date().toISOString() }))
    const { error } = await supabase.from('indicateurs').insert(rows)
    results.indicateurs = error ? error.message : `${rows.length} insérés`
  }

  if (parsed.signaux_geopolitiques?.length) {
    const rows = (parsed.signaux_geopolitiques as Record<string, unknown>[]).map(s => ({ ...s, fetched_at: new Date().toISOString() }))
    const { error } = await supabase.from('signaux_geopolitiques').insert(rows)
    results.signaux = error ? error.message : `${rows.length} insérés`
  }

  const alertes = [...(parsed.alertes_reglementation || []), ...(parsed.alertes_rh || [])]
  if (alertes.length) {
    const rows = (alertes as Record<string, unknown>[]).map(a => ({ ...a, created_at: new Date().toISOString(), lu: false }))
    const { error } = await supabase.from('alertes').insert(rows)
    results.alertes = error ? error.message : `${rows.length} insérées`
  }

  return NextResponse.json({ ok: true, semaine: SEMAINE, annee: ANNEE, results })
}
