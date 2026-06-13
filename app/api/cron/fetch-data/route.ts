import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getISOWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

function buildSystemPrompt() {
  return `Tu es l'analyste de marché de HoReCa.Watch, une plateforme de veille stratégique pour les professionnels de l'hôtellerie-restauration en France (CHR).

Ton rôle est de structurer les données de marché collectées chaque semaine depuis des sources réelles.

## Règles absolues
1. INTERDICTION TOTALE d'inventer ou d'estimer un prix. Utilise UNIQUEMENT les valeurs numériques fournies dans la section "Prix réels Alpha Vantage". Si une valeur est absente ou marquée "indisponible", mets "valeur": null — jamais un chiffre inventé.
2. Les indicateurs doivent avoir des noms précis : "Café arabica", "Blé tendre", "Sucre blanc", "Cacao", "Viande bovine", "Huile de tournesol", "Électricité spot", etc.
3. Les variations sont en pourcentage par rapport à la période précédente fournie dans les données.
4. Pour les signaux géopolitiques : ne signaler que ce qui a un impact direct probable sur les approvisionnements CHR en France dans les 4 à 8 semaines.
5. Pour la réglementation CHR : surveiller spécifiquement — SMIC et grilles HCR, TVA restauration, convention collective HCR (IDCC 1979), réglementation sanitaire (HACCP, allergènes, DLC), affichage des prix et menus, conditions de travail dans la restauration, licences et autorisations d'exploitation, normes d'accessibilité ERP restauration.
6. Niveau de langue : professionnel, factuel, sans sensationnalisme.

## Format de sortie
Retourne UNIQUEMENT un JSON valide, sans texte avant ni après, sans backticks markdown.

Le JSON doit contenir trois champs :

1. "indicateurs" — tableau d'objets avec cette structure exacte :
{
  "nom": "Café arabica",
  "valeur": 4250,
  "unite": "€/t",
  "variation_pct": 2.3,
  "periode": "mensuel",
  "source": "ICE",
  "categorie": "boissons"
}
Valeurs autorisées pour "categorie" : food, boissons, energie, rh, juridique
Valeurs autorisées pour "periode" : hebdo, mensuel, trimestr, annuel

2. "alertes_reglementation" — tableau d'alertes réglementaires CHR (SMIC, TVA, convention HCR, sanitaire, licences…). Laisser vide [] si rien de significatif cette semaine.
{
  "titre": "Revalorisation du SMIC au 1er juillet",
  "description": "Le SMIC horaire passe de 11,88 € à 12,08 €. Impact direct sur les grilles HCR et le coût salarial.",
  "severite": "high"
}
Valeurs autorisées pour "severite" : high, medium, low

3. "alertes_rh" — tableau d'alertes RH secteur CHR (accord de branche, temps de travail, grèves, pénurie de main-d'œuvre…). Laisser vide [] si rien de significatif cette semaine.
{
  "titre": "Accord sur les heures supplémentaires HCR",
  "description": "Nouveau taux de majoration à 25% dès la 36ème heure pour les établissements de moins de 50 salariés.",
  "severite": "medium"
}`
}

function buildUserPrompt(rawData: Record<string, string>, previousWeekData: string, semaine: number) {
  return `Voici les données collectées cette semaine pour HoReCa.Watch (semaine ${semaine}).

## Prix réels Alpha Vantage (source officielle — NE PAS modifier ces chiffres)
${rawData.alphavantage || 'Non disponible'}

## Flux RSS — L'Hôtellerie Restauration
${rawData.rss_chr || 'Non disponible'}

## Flux RSS — Journal Officiel (JORF général)
${rawData.jo || 'Non disponible'}

## Légifrance / JO — Veille réglementaire CHR (SMIC, TVA, convention HCR, sanitaire)
${rawData.legifrance_chr || 'Non disponible'}

## Données GDELT — Signaux géopolitiques
${rawData.gdelt || 'Non disponible'}

## Contexte semaine précédente (pour calculer les variations)
${previousWeekData || 'Première collecte — pas de référence précédente'}

Utilise UNIQUEMENT les prix Alpha Vantage pour les indicateurs chiffrés. Ne retourne que le JSON.`
}

type AVCommodity = { date: string; value: string }

async function fetchAlphaVantage(): Promise<string> {
  const key = process.env.ALPHA_VANTAGE_API_KEY
  if (!key) return 'Clé Alpha Vantage manquante'

  const base = 'https://www.alphavantage.co/query'

  try {
    const [fxRes, coffeeRes, wheatRes, sugarRes, cocoaRes] = await Promise.all([
      fetch(`${base}?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=EUR&apikey=${key}`, { next: { revalidate: 0 } }),
      fetch(`${base}?function=COFFEE&interval=monthly&apikey=${key}`, { next: { revalidate: 0 } }),
      fetch(`${base}?function=WHEAT&interval=monthly&apikey=${key}`, { next: { revalidate: 0 } }),
      fetch(`${base}?function=SUGAR&interval=monthly&apikey=${key}`, { next: { revalidate: 0 } }),
      fetch(`${base}?function=COCOA&interval=monthly&apikey=${key}`, { next: { revalidate: 0 } }),
    ])

    const [fxData, coffeeData, wheatData, sugarData, cocoaData] = await Promise.all([
      fxRes.json(), coffeeRes.json(), wheatRes.json(), sugarRes.json(), cocoaRes.json(),
    ])

    const usdToEur = parseFloat(fxData?.['Realtime Currency Exchange Rate']?.['5. Exchange Rate'] ?? '0')
    if (!usdToEur) return 'Taux de change USD/EUR indisponible'

    function latest2(data: { data?: AVCommodity[] }): [AVCommodity | null, AVCommodity | null] {
      const arr = data?.data ?? []
      return [arr[0] ?? null, arr[1] ?? null]
    }

    function pct(curr: string, prev: string): number | null {
      const c = parseFloat(curr), p = parseFloat(prev)
      if (!c || !p) return null
      return Math.round((c - p) / p * 1000) / 10
    }

    const [coffeeCurr, coffeePrev] = latest2(coffeeData)
    const [wheatCurr, wheatPrev]   = latest2(wheatData)
    const [sugarCurr, sugarPrev]   = latest2(sugarData)
    const [cocoaCurr, cocoaPrev]   = latest2(cocoaData)

    // cents/lb → €/t  (1 lb = 0.453592 kg → 1 t = 2204.62 lb)
    const centsLbToEurT = (v: string) => Math.round(parseFloat(v) / 100 * 2204.62 * usdToEur)
    // cents/bushel → €/t  (1 bushel wheat = 27.2155 kg)
    const centsBuToEurT = (v: string) => Math.round(parseFloat(v) / 100 / 0.0272155 * usdToEur)
    // USD/metric ton → €/t
    const usdTToEurT    = (v: string) => Math.round(parseFloat(v) * usdToEur)

    const lines: string[] = [`Taux EUR/USD utilisé : ${usdToEur}`]

    if (coffeeCurr) lines.push(
      `Café arabica : ${centsLbToEurT(coffeeCurr.value)} €/t (${coffeeCurr.date})` +
      (coffeePrev ? ` | mois précédent : ${centsLbToEurT(coffeePrev.value)} €/t | variation : ${pct(coffeeCurr.value, coffeePrev.value)}%` : '')
    )
    if (wheatCurr) lines.push(
      `Blé tendre : ${centsBuToEurT(wheatCurr.value)} €/t (${wheatCurr.date})` +
      (wheatPrev ? ` | mois précédent : ${centsBuToEurT(wheatPrev.value)} €/t | variation : ${pct(wheatCurr.value, wheatPrev.value)}%` : '')
    )
    if (sugarCurr) lines.push(
      `Sucre blanc : ${centsLbToEurT(sugarCurr.value)} €/t (${sugarCurr.date})` +
      (sugarPrev ? ` | mois précédent : ${centsLbToEurT(sugarPrev.value)} €/t | variation : ${pct(sugarCurr.value, sugarPrev.value)}%` : '')
    )
    if (cocoaCurr) lines.push(
      `Cacao : ${usdTToEurT(cocoaCurr.value)} €/t (${cocoaCurr.date})` +
      (cocoaPrev ? ` | mois précédent : ${usdTToEurT(cocoaPrev.value)} €/t | variation : ${pct(cocoaCurr.value, cocoaPrev.value)}%` : '')
    )

    return lines.join('\n')
  } catch (e) {
    return `Erreur fetch Alpha Vantage: ${String(e)}`
  }
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

async function fetchLegifranceCHR(): Promise<string> {
  try {
    // JO Économie & Social — catégorie travail/social
    const [resJorf, resTravail] = await Promise.allSettled([
      fetch('https://www.legifrance.gouv.fr/rss/jorf.xml', { next: { revalidate: 0 } }),
      fetch('https://travail-emploi.gouv.fr/actualites/rss.xml', { next: { revalidate: 0 } }),
    ])
    const parts: string[] = []
    if (resJorf.status === 'fulfilled' && resJorf.value.ok) {
      const t = await resJorf.value.text()
      // Filtrer les items contenant des termes HoReCa dans le XML
      const items = t.match(/<item>[\s\S]*?<\/item>/g) || []
      const chrTerms = /restaur|hôtel|hôtellerie|CHR|SMIC|HCR|TVA|sanitaire|hygiène|allergen|affichage|licence|débits/i
      const relevant = items.filter(i => chrTerms.test(i)).slice(0, 5)
      parts.push('=== Journal Officiel (items CHR) ===\n' + (relevant.length ? relevant.join('\n') : t.slice(0, 2000)))
    }
    if (resTravail.status === 'fulfilled' && resTravail.value.ok) {
      const t = await resTravail.value.text()
      parts.push('=== Ministère du Travail RSS ===\n' + t.slice(0, 1500))
    }
    return parts.join('\n\n') || 'Non disponible'
  } catch { return 'Erreur fetch Légifrance CHR' }
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

  // Paramètres optionnels pour backfill d'une semaine passée
  const url = new URL(request.url)
  const now = new Date()
  const SEMAINE = url.searchParams.get('semaine') ? parseInt(url.searchParams.get('semaine')!) : getISOWeek(now)
  const ANNEE = url.searchParams.get('annee') ? parseInt(url.searchParams.get('annee')!) : now.getFullYear()

  // 1. Fetch toutes les sources en parallèle
  const [alphavantage, gdelt, jo, rss_chr, legifrance_chr] = await Promise.all([
    fetchAlphaVantage(),
    fetchGDELT(),
    fetchJO(),
    fetchRSSCHR(),
    fetchLegifranceCHR(),
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
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: buildSystemPrompt(),
      messages: [{
        role: 'user',
        content: buildUserPrompt({ alphavantage, gdelt, jo, rss_chr, legifrance_chr }, JSON.stringify(prevWeek || []), SEMAINE),
      }],
    }),
  })

  const claudeData = await claudeRes.json()
  if (!claudeRes.ok || claudeData.error) {
    console.error('[cron/fetch-data] Erreur Claude API:', JSON.stringify(claudeData))
    return NextResponse.json({ error: 'Claude API error', detail: claudeData.error ?? claudeData }, { status: 500 })
  }
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

  // 5. Insérer dans Supabase (delete + insert pour idempotence)
  const results: Record<string, unknown> = {}

  if (parsed.indicateurs?.length) {
    await supabase.from('indicateurs').delete().eq('semaine', SEMAINE).eq('annee', ANNEE)
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
