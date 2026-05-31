import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'
import Link from 'next/link'
import { IconTrendingUp, IconTrendingDown, IconLock } from '@tabler/icons-react'

function getISOWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export function newsletterToken(annee: number, semaine: number): string {
  const secret = process.env.NEWSLETTER_SECRET || process.env.CRON_SECRET || 'horeca'
  return createHmac('sha256', secret).update(`${annee}-S${semaine}`).digest('hex').slice(0, 8)
}

function parseSlug(slug: string): { semaine: number; annee: number; token: string } | null {
  // Format : 2026-S22-a3f8b2c1
  const match = slug.match(/^(\d{4})-S(\d{1,2})-([a-f0-9]{8})$/)
  if (!match) return null
  return { annee: parseInt(match[1]), semaine: parseInt(match[2]), token: match[3] }
}

const CATEGORIES = [
  { key: 'food',     label: 'Alimentation' },
  { key: 'boissons', label: 'Boissons' },
]

const EXAMPLE_IMPACTS = [
  { nom: 'Café arabica',      vol: 40,  impact: 45 },
  { nom: 'Viande bovine',     vol: 80,  impact: 38 },
  { nom: 'Produits laitiers', vol: 120, impact: 37 },
]

export default async function NewsletterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const parsed = parseSlug(slug)
  if (!parsed) notFound()

  const { semaine, annee, token } = parsed

  // Valider le token
  if (token !== newsletterToken(annee, semaine)) notFound()

  // Valider que la semaine est plausible
  if (annee < 2025 || annee > 2030 || semaine < 1 || semaine > 53) notFound()

  const currentSemaine = getISOWeek(new Date())
  const currentAnnee = new Date().getFullYear()

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: indicateurs } = await admin
    .from('indicateurs')
    .select('id, nom, valeur, unite, variation_pct, source, categorie')
    .in('categorie', ['food', 'boissons'])
    .eq('semaine', semaine)
    .eq('annee', annee)
    .order('categorie')
    .order('variation_pct', { ascending: false })

  const isCurrent = semaine === currentSemaine && annee === currentAnnee
  const dateLabel = `Semaine ${semaine} · ${annee}`

  return (
    <div style={{ minHeight: '100vh', background: '#F8F8FC', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* HEADER */}
      <div style={{ background: '#26215C', padding: '20px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 18, fontWeight: 500, color: '#fff' }}>HoReCa<span style={{ color: '#AFA9EC' }}>.</span>Watch</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#AFA9EC' }}>Veille marché CHR · {dateLabel}</span>
            {isCurrent && (
              <span style={{ fontSize: 10, background: '#1F1A4A', color: '#1D9E75', padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#1D9E75', display: 'inline-block' }} />
                Cette semaine
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* INTRO */}
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#26215C', margin: 0 }}>
            Bulletin marché CHR — {dateLabel}
          </h1>
          <p style={{ fontSize: 13, color: '#888780', marginTop: 6, marginBottom: 0 }}>
            Alimentation &amp; Boissons · Sources : FranceAgriMer · Matif · ICE
          </p>
        </div>

        {/* INDICATEURS PAR CATEGORIE */}
        {indicateurs && indicateurs.length > 0 ? (
          CATEGORIES.map(cat => {
            const inds = indicateurs.filter(i => i.categorie === cat.key)
            if (!inds.length) return null
            return (
              <div key={cat.key} style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#26215C', marginBottom: 14 }}>{cat.label}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {inds.map(ind => {
                    const up = ind.variation_pct > 0
                    const stable = ind.variation_pct === 0
                    const valNum = Number(ind.valeur)
                    const valStr = valNum >= 1000
                      ? valNum.toLocaleString('fr-FR')
                      : valNum.toLocaleString('fr-FR', { minimumFractionDigits: valNum % 1 !== 0 ? 2 : 0 })
                    const val = ind.unite?.startsWith('€') ? `${valStr} €`
                      : ind.unite?.startsWith('%') ? `${valStr} %`
                      : ind.unite?.includes('pts') ? `${valStr} pts`
                      : valStr
                    return (
                      <div key={ind.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#F8F8FC', borderRadius: 9 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#26215C' }}>{ind.nom}</div>
                          <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>{ind.source}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: '#26215C' }}>{val}</div>
                          <span style={{
                            fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500,
                            background: stable ? '#EEEDFE' : up ? '#FCEBEB' : '#EAF3DE',
                            color: stable ? '#3C3489' : up ? '#A32D2D' : '#3B6D11',
                            display: 'flex', alignItems: 'center', gap: 3,
                          }}>
                            {!stable && (up ? <IconTrendingUp size={10} /> : <IconTrendingDown size={10} />)}
                            {stable ? '= stable' : `${up ? '+' : ''}${Number(ind.variation_pct).toFixed(1)}%`}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        ) : (
          <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13, padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📡</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#26215C' }}>Données en cours de collecte</div>
            <div style={{ fontSize: 12, color: '#888780', marginTop: 6 }}>Les indicateurs seront disponibles en début de semaine.</div>
          </div>
        )}

        {/* BLOC IMPACT PRO */}
        <div style={{ background: 'linear-gradient(135deg, #26215C 0%, #3C3489 100%)', borderRadius: 13, padding: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(175,169,236,0.08)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <IconLock size={13} color="#AFA9EC" />
            <span style={{ fontSize: 10, color: '#AFA9EC', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Plan Pro</span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 8, lineHeight: 1.3 }}>
            Votre impact financier, calculé chaque semaine
          </div>
          <div style={{ fontSize: 13, color: '#AFA9EC', lineHeight: 1.6, marginBottom: 20 }}>
            Renseignez vos volumes d'achats et recevez chaque semaine l'impact exact de ces variations sur votre trésorerie.
          </div>

          {/* Exemple flou */}
          <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px', marginBottom: 20, filter: 'blur(2.5px)', userSelect: 'none', pointerEvents: 'none' }}>
            {EXAMPLE_IMPACTS.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < EXAMPLE_IMPACTS.length - 1 ? '0.5px solid rgba(255,255,255,0.1)' : 'none' }}>
                <span style={{ fontSize: 12, color: '#AFA9EC' }}>{f.nom} · {f.vol} kg/mois</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#FF9999' }}>+{f.impact} €</span>
              </div>
            ))}
            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', textAlign: 'right', marginTop: 10 }}>
              Impact total : +120 € ce mois
            </div>
          </div>

          <Link href="/pricing" style={{
            display: 'inline-block',
            background: '#fff',
            color: '#26215C',
            padding: '11px 24px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13,
            textDecoration: 'none',
          }}>
            Passer au plan Pro — 19 €/mois →
          </Link>
        </div>

        {/* FOOTER */}
        <div style={{ textAlign: 'center', padding: '8px 0 32px', fontSize: 11, color: '#888780', lineHeight: 2 }}>
          <Link href="/dashboard" style={{ color: '#534AB7', textDecoration: 'none', fontWeight: 500 }}>Accéder au dashboard complet</Link>
          <span style={{ margin: '0 8px' }}>·</span>
          Sources : FranceAgriMer · Matif · ICE
        </div>

      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
