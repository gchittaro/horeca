import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const KEYWORDS = [
  'cacao "Côte d\'Ivoire"',
  'café arabica Brésil',
  'blé Ukraine',
  '"huile tournesol"',
  '"Mer Rouge" shipping food',
]

export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const articles: unknown[] = []

  for (const kw of KEYWORDS) {
    try {
      const q = encodeURIComponent(kw)
      const res = await fetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&mode=artlist&maxrecords=5&format=json`, { next: { revalidate: 0 } })
      const data = await res.json()
      if (data?.articles) articles.push(...data.articles)
    } catch { /* continue */ }
  }

  if (!articles.length) {
    return NextResponse.json({ ok: true, signals: 0, reason: 'Aucun article GDELT' })
  }

  // Synthèse via Claude
  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Tu es analyste marché CHR. Voici ${articles.length} articles GDELT sur les tensions d'approvisionnement alimentaire.

${JSON.stringify(articles.slice(0, 10))}

Retourne UNIQUEMENT un JSON valide (sans texte autour) :
{
  "signaux": [
    {
      "titre": "...",
      "description": "...",
      "zone": "...",
      "produits_lies": ["..."],
      "impact_probable": "hausse|baisse|incertain",
      "horizon": "...",
      "intensite": "faible|modérée|élevée",
      "source": "GDELT",
      "action_recommandee": "..."
    }
  ]
}

Ne retenir que les signaux ayant un impact direct sur les approvisionnements CHR en France dans les 4-8 semaines.`,
      }],
    }),
  })

  const claudeData = await claudeRes.json()
  const text: string = claudeData.content?.[0]?.text || ''

  let parsed: { signaux?: unknown[] }
  try {
    parsed = JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return NextResponse.json({ error: 'Parse error' }, { status: 500 })
    parsed = JSON.parse(match[0])
  }

  if (parsed.signaux?.length) {
    const rows = (parsed.signaux as Record<string, unknown>[]).map(s => ({ ...s, fetched_at: new Date().toISOString() }))
    await supabase.from('signaux_geopolitiques').insert(rows)
  }

  return NextResponse.json({ ok: true, signals: parsed.signaux?.length || 0 })
}
