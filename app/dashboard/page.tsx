import { IconWorld, IconRipple, IconCheck } from '@tabler/icons-react'
import { createClient } from '@/lib/supabase/server'
import { getISOWeek } from '@/lib/utils'
import { mockIndicateurs, mockSignaux, mockAlertes } from '@/lib/mock-data'

function PillVariation({ pct }: { pct: number }) {
  if (pct === 0) return <div style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500, background: '#EEEDFE', color: '#3C3489', display: 'inline-block' }}>= stable</div>
  const up = pct > 0
  return (
    <div style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500, background: up ? '#FCEBEB' : '#EAF3DE', color: up ? '#A32D2D' : '#3B6D11', display: 'inline-block' }}>
      {up ? '↑ +' : '↓ '}{Math.abs(pct).toFixed(1)}%
    </div>
  )
}

function AlertBar({ severite }: { severite: string }) {
  const color = severite === 'high' ? '#E24B4A' : severite === 'medium' ? '#BA7517' : '#7F77DD'
  return <div style={{ width: 3, height: 36, borderRadius: 2, flexShrink: 0, background: color }} />
}

type Indicateur = { id: string; nom: string; valeur: number; unite: string; variation_pct: number; source: string; categorie: string }
type Signal = { id: string; titre: string; description: string; horizon: string; impact: string; positive?: boolean }
type Alerte = { id: string; titre: string; description: string; severite: string; created_at?: string; time_display?: string }

function formatTime(created_at: string): string {
  const d = new Date(created_at)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000) return "Aujourd'hui"
  if (diff < 7 * 86400000) return `Il y a ${Math.floor(diff / 86400000)}j`
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const now = new Date()
  const semaine = getISOWeek(now)
  const annee = now.getFullYear()

  const [{ data: indicateursDB }, { data: signauxDB }, { data: alertesDB }] = await Promise.all([
    supabase.from('indicateurs').select('*').eq('semaine', semaine).eq('annee', annee).order('categorie'),
    supabase.from('signaux_geopolitiques').select('*').order('fetched_at', { ascending: false }).limit(3),
    supabase.from('alertes').select('*').is('lu', false).order('created_at', { ascending: false }).limit(5),
  ])

  const indicateurs: Indicateur[] = (indicateursDB?.length ? indicateursDB : mockIndicateurs) as Indicateur[]
  const signaux: Signal[]          = (signauxDB?.length   ? signauxDB.map(s => ({ ...s, positive: s.impact === 'baisse' })) : mockSignaux) as Signal[]
  const alertes: Alerte[]          = (alertesDB?.length   ? alertesDB : mockAlertes) as Alerte[]

  const foodIndicateurs = indicateurs.filter(i => i.categorie === 'food')
  const energieInd = indicateurs.find(i => i.categorie === 'energie')

  // KPIs calculés
  const alertesActives = alertes.length
  const hausses = alertes.filter(a => a.severite === 'high').length
  const baisses = alertes.filter(a => a.severite === 'low').length

  return (
    <div style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1100, margin: '0 auto' }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        {[
          { label: 'Indice panier CHR', val: '124,3', delta: '↑ +2,1% ce mois', up: true },
          { label: 'Alertes actives',   val: String(alertesActives), delta: `${hausses} haute${hausses > 1 ? 's' : ''} · ${baisses} basse${baisses > 1 ? 's' : ''}`, up: null },
          { label: 'Signal géopolitique', val: 'Cacao · Café', delta: 'Tension active', up: true, small: true },
          {
            label: 'Électricité spot',
            val: energieInd ? `${energieInd.valeur} €` : '—',
            delta: energieInd ? `${energieInd.variation_pct > 0 ? '↑' : '↓'} ${energieInd.variation_pct}% · ${energieInd.source}` : '—',
            up: energieInd ? energieInd.variation_pct > 0 : null,
          },
        ].map(k => (
          <div key={k.label} style={{ background: '#26215C', borderRadius: 11, padding: 15 }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#AFA9EC', marginBottom: 5 }}>{k.label}</div>
            <div style={{ fontSize: k.small ? 14 : 22, fontWeight: 500, color: k.small ? '#FAC775' : '#fff', lineHeight: 1.1, paddingTop: k.small ? 5 : 0 }}>{k.val}</div>
            <div style={{ fontSize: 11, marginTop: 4, color: k.up === true ? '#F09595' : k.up === false ? '#97C459' : '#AFA9EC' }}>{k.delta}</div>
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Matières premières */}
        <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#26215C', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            Matières premières Food
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7F77DD', fontWeight: 400 }}>FranceAgriMer · Matif · ICE</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {foodIndicateurs.map(ind => (
              <div key={ind.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 11px', background: '#F8F8FC', borderRadius: 9 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#26215C' }}>{ind.nom}</div>
                  <div style={{ fontSize: 10, color: '#888780', marginTop: 2 }}>{ind.source} · {ind.unite}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#26215C' }}>
                    {ind.valeur >= 1000
                      ? ind.valeur.toLocaleString('fr-FR') + ' €'
                      : ind.valeur.toLocaleString('fr-FR', { minimumFractionDigits: ind.valeur % 1 !== 0 ? 2 : 0 }) + ' €'}
                  </div>
                  <PillVariation pct={ind.variation_pct} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signaux géopolitiques */}
        <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#26215C', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            Signaux géopolitiques
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7F77DD', fontWeight: 400 }}>GDELT · toutes les heures</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {signaux.map((sig, i) => (
              <div key={sig.id} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '11px 12px', background: sig.positive ? '#E1F5EE' : '#EEEDFE', border: `0.5px solid ${sig.positive ? '#9FE1CB' : '#CECBF6'}`, borderRadius: 9 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {sig.positive ? <IconCheck size={14} color="#0F6E56" /> : i === 1 ? <IconRipple size={14} color="#534AB7" /> : <IconWorld size={14} color="#534AB7" />}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: sig.positive ? '#04342C' : '#26215C', lineHeight: 1.4, marginBottom: 2 }}>{sig.titre}</div>
                  <div style={{ fontSize: 11, color: sig.positive ? '#0F6E56' : '#534AB7', lineHeight: 1.4, marginBottom: 4 }}>{sig.description}</div>
                  <div style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: sig.positive ? '#E1F5EE' : '#FAEEDA', color: sig.positive ? '#085041' : '#633806', fontWeight: 500, display: 'inline-block' }}>{sig.horizon}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ALERTES */}
      <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13, padding: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#26215C', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          Alertes de la semaine
          <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7F77DD', fontWeight: 400 }}>Semaine {semaine} · {annee}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {alertes.map(a => (
            <div key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '11px 14px', background: '#fff', border: '0.5px solid #E8E7F4', borderRadius: 9 }}>
              <AlertBar severite={a.severite} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#26215C', marginBottom: 2 }}>{a.titre}</div>
                <div style={{ fontSize: 11, color: '#5F5E5A', lineHeight: 1.4 }}>{a.description}</div>
              </div>
              <div style={{ fontSize: 10, color: '#888780', whiteSpace: 'nowrap' }}>
                {a.time_display ?? (a.created_at ? formatTime(a.created_at) : '')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
