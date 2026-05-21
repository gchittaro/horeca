import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getISOWeek } from '@/lib/utils'
import { mockIndicateurs, mockSignaux } from '@/lib/mock-data'
import { IconSalad, IconGlassFull, IconBolt, IconUsers, IconScale, IconWorld } from '@tabler/icons-react'

type Categorie = 'food' | 'boissons' | 'energie' | 'rh' | 'juridique' | 'geopolitique'

const categorieConfig: Record<Categorie, { label: string; Icon: React.ElementType }> = {
  food:         { label: 'Food',         Icon: IconSalad },
  boissons:     { label: 'Boissons',     Icon: IconGlassFull },
  energie:      { label: 'Énergie',      Icon: IconBolt },
  rh:           { label: 'RH',           Icon: IconUsers },
  juridique:    { label: 'Juridique',    Icon: IconScale },
  geopolitique: { label: 'Géopolitique', Icon: IconWorld },
}

function PillVariation({ pct }: { pct: number }) {
  if (pct === 0) return <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500, background: '#EEEDFE', color: '#3C3489' }}>= stable</span>
  const up = pct > 0
  return (
    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500, background: up ? '#FCEBEB' : '#EAF3DE', color: up ? '#A32D2D' : '#3B6D11' }}>
      {up ? '↑ +' : '↓ '}{Math.abs(pct).toFixed(1)}%
    </span>
  )
}

export default async function CategoriePage({ params }: { params: Promise<{ categorie: string }> }) {
  const { categorie } = await params
  const cat = categorie as Categorie
  const config = categorieConfig[cat]
  if (!config) notFound()

  const { label, Icon } = config

  const supabase = await createClient()
  const now = new Date()
  const semaine = getISOWeek(now)
  const annee = now.getFullYear()

  const [{ data: indicateursDB }, { data: signauxDB }] = await Promise.all([
    supabase.from('indicateurs').select('*').eq('categorie', cat).eq('semaine', semaine).eq('annee', annee),
    cat === 'geopolitique'
      ? supabase.from('signaux_geopolitiques').select('*').order('fetched_at', { ascending: false }).limit(10)
      : Promise.resolve({ data: [] }),
  ])

  const indicateurs = indicateursDB?.length
    ? indicateursDB
    : mockIndicateurs.filter(i => i.categorie === cat)

  const signaux = signauxDB?.length
    ? signauxDB.map(s => ({ ...s, positive: s.impact === 'baisse' }))
    : cat === 'geopolitique' ? mockSignaux : []

  return (
    <div style={{ padding: '18px 24px', maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#26215C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color="#AFA9EC" />
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 500, color: '#26215C' }}>{label}</div>
          <div style={{ fontSize: 12, color: '#888780' }}>Indicateurs · Semaine {semaine}, {annee}</div>
        </div>
      </div>

      {/* Indicateurs */}
      {indicateurs.length > 0 ? (
        <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#26215C', marginBottom: 14 }}>Indicateurs {label}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {indicateurs.map(ind => (
              <div key={ind.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 13px', background: '#F8F8FC', borderRadius: 9 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#26215C' }}>{ind.nom}</div>
                  <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>{ind.source} · {ind.unite}</div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#26215C' }}>
                    {ind.valeur >= 1000
                      ? ind.valeur.toLocaleString('fr-FR') + ' €'
                      : Number(ind.valeur).toLocaleString('fr-FR', { minimumFractionDigits: ind.valeur % 1 !== 0 ? 2 : 0 }) + ' €'}
                  </div>
                  <PillVariation pct={Number(ind.variation_pct)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13, padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📡</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#26215C', marginBottom: 6 }}>Données en cours de collecte</div>
          <div style={{ fontSize: 13, color: '#888780' }}>Les indicateurs {label} seront disponibles après le premier cron de fetch.</div>
        </div>
      )}

      {/* Signaux géopolitiques */}
      {signaux.length > 0 && (
        <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#26215C', marginBottom: 14 }}>Signaux GDELT</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {signaux.map(sig => (
              <div key={sig.id} style={{ background: sig.positive ? '#E1F5EE' : '#EEEDFE', border: `0.5px solid ${sig.positive ? '#9FE1CB' : '#CECBF6'}`, borderRadius: 9, padding: '12px 14px' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: sig.positive ? '#04342C' : '#26215C', marginBottom: 4 }}>{sig.titre}</div>
                <div style={{ fontSize: 12, color: sig.positive ? '#0F6E56' : '#534AB7', lineHeight: 1.5, marginBottom: 6 }}>{sig.description}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: sig.positive ? '#E1F5EE' : '#FAEEDA', color: sig.positive ? '#085041' : '#633806', fontWeight: 500 }}>{sig.horizon}</span>
                  {sig.zone && <span style={{ fontSize: 10, color: '#888780' }}>Zone : {sig.zone}</span>}
                  {sig.source && <span style={{ fontSize: 10, color: '#888780' }}>Source : {sig.source}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function generateStaticParams() {
  return Object.keys(categorieConfig).map(cat => ({ categorie: cat }))
}
