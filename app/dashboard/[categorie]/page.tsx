import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getUserIsPro } from '@/lib/supabase/isPro'
import { getISOWeek, formatUpdateDate } from '@/lib/utils'
import { mockIndicateurs, mockSignaux } from '@/lib/mock-data'
import { IconSalad, IconGlassFull, IconBolt, IconUsers, IconScale, IconWorld, IconAlertTriangle, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react'

const CATEGORY_IMPACTS: Partial<Record<Categorie, { key: string; nom: string; variation_pct: number }[]>> = {
  food: [
    { key: 'vol_viandes',  nom: 'Viande bovine',     variation_pct:  4.7 },
    { key: 'vol_laitiers', nom: 'Produits laitiers', variation_pct:  3.1 },
    { key: 'vol_huiles',   nom: 'Huile tournesol',   variation_pct: -2.8 },
    { key: 'vol_farine',   nom: 'Farine T55',        variation_pct:  0   },
  ],
  boissons: [
    { key: 'vol_cafe',     nom: 'Café arabica',      variation_pct: 11.2 },
  ],
  energie: [
    { key: 'vol_energie',  nom: 'Électricité & gaz', variation_pct: -6.1 },
  ],
}

type Categorie = 'food' | 'boissons' | 'energie' | 'rh' | 'juridique' | 'geopolitique'

const categorieConfig: Record<Categorie, { label: string; Icon: React.ElementType }> = {
  food:         { label: 'Alimentation', Icon: IconSalad },
  boissons:     { label: 'Boissons',     Icon: IconGlassFull },
  energie:      { label: 'Énergie',      Icon: IconBolt },
  rh:           { label: 'RH',           Icon: IconUsers },
  juridique:    { label: 'Juridique',    Icon: IconScale },
  geopolitique: { label: 'Géopolitique', Icon: IconWorld },
}

function formatValue(valeur: number, unite: string): string {
  const num = valeur >= 1000
    ? valeur.toLocaleString('fr-FR')
    : Number(valeur).toLocaleString('fr-FR', { minimumFractionDigits: valeur % 1 !== 0 ? 2 : 0 })
  if (unite.startsWith('€')) return num + ' €'
  if (unite.startsWith('%')) return num + ' %'
  if (unite.includes('pts')) return num + ' pts'
  return num
}

const periodeLabel: Record<string, string> = {
  hebdo:    'vs sem. préc.',
  mensuel:  'vs mois préc.',
  annuel:   'vs an préc.',
  trimestr: 'vs trim. préc.',
  semestr:  'vs sem. préc.',
}

function PillVariation({ pct, periode }: { pct: number; periode?: string }) {
  const label = periode ? periodeLabel[periode] ?? periode : 'vs sem. préc.'
  if (pct === 0) return (
    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500, background: '#EEEDFE', color: '#3C3489' }}>= stable</span>
      <span style={{ fontSize: 9, color: '#B0AED6' }}>{label}</span>
    </span>
  )
  const up = pct > 0
  return (
    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500, background: up ? '#FCEBEB' : '#EAF3DE', color: up ? '#A32D2D' : '#3B6D11' }}>
        {up ? '↑ +' : '↓ '}{Math.abs(pct).toFixed(1)}%
      </span>
      <span style={{ fontSize: 9, color: '#B0AED6' }}>{label}</span>
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
  const { data: { user } } = await supabase.auth.getUser()
  const now = new Date()
  const semaine = getISOWeek(now)
  const annee = now.getFullYear()

  // Bloc impact estimé — pour les catégories food, boissons, énergie
  let catImpacts: { nom: string; vol: number; variation_pct: number; impact: number }[] = []
  if (CATEGORY_IMPACTS[cat] && user) {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: membership } = await admin
      .from('organisation_members')
      .select('organisations(owner_id)')
      .eq('user_id', user.id)
      .limit(1)
      .single()
    const ownerId = (membership?.organisations as { owner_id?: string } | null)?.owner_id ?? user.id
    const { data: etab } = await admin
      .from('etablissements')
      .select('vol_cafe, vol_viandes, vol_laitiers, vol_huiles, vol_farine, vol_energie, plan')
      .eq('user_id', ownerId)
      .single()
    if (etab && (etab.plan === 'pro' || etab.plan === 'team')) {
      catImpacts = (CATEGORY_IMPACTS[cat] ?? [])
        .map(f => ({ nom: f.nom, vol: (etab as Record<string, number>)[f.key] || 0, variation_pct: f.variation_pct, impact: Math.round(((etab as Record<string, number>)[f.key] || 0) * f.variation_pct / 100) }))
        .filter(f => f.vol > 0)
    }
  }

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
          <div style={{ fontSize: 12, color: '#888780' }}>{cat === 'geopolitique' ? 'Signaux GDELT' : 'Indicateurs'} · Mis à jour le {formatUpdateDate()}</div>
        </div>
      </div>

      {/* Bloc impact estimé — food, boissons, énergie */}
      {catImpacts.length > 0 && (
        <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#26215C', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconAlertTriangle size={15} color="#BA7517" />
            Impact estimé sur vos achats — cette semaine
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {catImpacts.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: '#F8F8FC', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: '#26215C' }}>{f.nom} <span style={{ color: '#888780' }}>· {f.vol} kg/mois</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: f.variation_pct > 0 ? '#A32D2D' : f.variation_pct < 0 ? '#3B6D11' : '#888780' }}>
                    {f.variation_pct > 0 ? '+' : ''}{f.variation_pct}%
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: f.impact > 0 ? '#A32D2D' : f.impact < 0 ? '#3B6D11' : '#888780', display: 'flex', alignItems: 'center', gap: 3 }}>
                    {f.impact > 0 ? <IconTrendingUp size={13} /> : f.impact < 0 ? <IconTrendingDown size={13} /> : null}
                    {f.impact > 0 ? '+' : ''}{f.impact} €
                  </span>
                </div>
              </div>
            ))}
            <div style={{ fontSize: 11, color: '#534AB7', fontWeight: 500, textAlign: 'right', marginTop: 4 }}>
              Impact total : {catImpacts.reduce((s, f) => s + f.impact, 0) > 0 ? '+' : ''}{catImpacts.reduce((s, f) => s + f.impact, 0)} € cette semaine
            </div>
          </div>
        </div>
      )}

      {/* Indicateurs — masqué pour géopolitique (pas d'indicateurs chiffrés) */}
      {cat !== 'geopolitique' && (
        indicateurs.length > 0 ? (
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
                      {formatValue(Number(ind.valeur), ind.unite)}
                    </div>
                    <PillVariation pct={Number(ind.variation_pct)} periode={(ind as { periode?: string }).periode} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13, padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📡</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#26215C' }}>Données en cours de collecte</div>
          </div>
        )
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
