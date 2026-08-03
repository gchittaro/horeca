'use client'

import { useMemo, useState } from 'react'
import {
  IconMeat, IconEgg, IconCoffee, IconWheat, IconDroplet, IconBolt, IconShoppingCart,
} from '@tabler/icons-react'
import NavSignupButton from '@/app/components/NavSignupButton'

export type SimIndicateur = {
  key: string
  nom: string
  variation_pct: number
  valeur: number | null
  unite: string | null
  source: string
  periode?: string
}

const periodeLabel: Record<string, string> = {
  hebdo:    'vs sem. préc.',
  mensuel:  'vs mois préc.',
  annuel:   'vs an préc.',
  trimestr: 'vs trim. préc.',
  semestr:  'vs sem. préc.',
}

function PillVariation({ pct, periode }: { pct: number; periode?: string }) {
  const label = periode ? (periodeLabel[periode] ?? periode) : 'vs sem. préc.'
  if (pct === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
      <div style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500, background: '#EEEDFE', color: '#3C3489' }}>= stable</div>
      <div style={{ fontSize: 9, color: '#8f8ac4' }}>{label}</div>
    </div>
  )
  const up = pct > 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
      <div style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500, background: up ? '#FCEBEB' : '#EAF3DE', color: up ? '#A32D2D' : '#3B6D11' }}>
        {up ? '↑ +' : '↓ '}{Math.abs(pct).toFixed(1)}%
      </div>
      <div style={{ fontSize: 9, color: '#8f8ac4' }}>{label}</div>
    </div>
  )
}

const ICONS: Record<string, React.ElementType> = {
  vol_cafe: IconCoffee,
  vol_viandes: IconMeat,
  vol_laitiers: IconEgg,
  vol_farine: IconWheat,
  vol_huiles: IconDroplet,
  vol_energie: IconBolt,
}

const LABELS: Record<string, string> = {
  vol_cafe: 'Café & boissons chaudes',
  vol_viandes: 'Viandes',
  vol_laitiers: 'Produits laitiers & œufs',
  vol_farine: 'Farine & pâtisserie',
  vol_huiles: 'Huiles & matières grasses',
  vol_energie: 'Énergie (élec + gaz)',
}

export default function SimulatorForm({ indicateurs }: { indicateurs: SimIndicateur[] }) {
  const [volumes, setVolumes] = useState<Record<string, number>>(
    () => Object.fromEntries(indicateurs.map(i => [i.key, 0]))
  )

  function setVol(key: string, val: string) {
    setVolumes(prev => ({ ...prev, [key]: parseFloat(val) || 0 }))
  }

  const impacts = useMemo(() => indicateurs.map(ind => {
    const volume = volumes[ind.key] || 0
    return { ...ind, volume, impact: Math.round(volume * ind.variation_pct / 100) }
  }), [volumes, indicateurs])

  const totalImpact = useMemo(() => impacts.reduce((sum, i) => sum + i.impact, 0), [impacts])
  const hasVolumes = impacts.some(i => i.volume > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Volumes d'achats */}
      <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#26215C', display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconShoppingCart size={17} color="#534AB7" /> Vos volumes d&apos;achats mensuels
        </div>
        <div style={{ fontSize: 12, color: '#888780', lineHeight: 1.5, marginTop: -8 }}>
          Renseignez vos dépenses moyennes par poste pour estimer l&apos;impact des variations de marché de cette semaine sur votre établissement.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
          {indicateurs.map(ind => {
            const Icon = ICONS[ind.key] ?? IconShoppingCart
            return (
              <div key={ind.key} style={{ background: '#F8F8FC', border: '0.5px solid #CECBF6', borderRadius: 9, padding: '11px 13px' }}>
                <div style={{ fontSize: 11, color: '#5F5E5A', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                  <Icon size={14} color="#534AB7" /> {LABELS[ind.key] ?? ind.nom}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <input
                    type="number"
                    min={0}
                    value={volumes[ind.key] || ''}
                    onChange={e => setVol(ind.key, e.target.value)}
                    placeholder="0"
                    style={{ fontSize: 18, fontWeight: 500, color: '#26215C', border: 'none', background: 'transparent', width: 90, padding: 0, outline: 'none' }}
                  />
                  <span style={{ fontSize: 11, color: '#888780' }}>€ / mois</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Impact calculé */}
      <div style={{ background: '#26215C', borderRadius: 13, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#AFA9EC', fontWeight: 500 }}>
          Impact estimé cette semaine
        </div>
        <div style={{ fontSize: 13, color: '#D3D1C7', lineHeight: 1.7 }}>
          {totalImpact > 0 && <>Basé sur vos volumes, les variations de la semaine représentent un <strong style={{ color: '#F09595' }}>surcoût estimé de +{totalImpact} €</strong>.</>}
          {totalImpact < 0 && <>Basé sur vos volumes, les variations de la semaine représentent une <span style={{ color: '#97C459' }}>économie estimée de {Math.abs(totalImpact)} €</span>.</>}
          {totalImpact === 0 && !hasVolumes && <>Renseignez vos volumes ci-dessus pour calculer l&apos;impact sur votre établissement.</>}
          {totalImpact === 0 && hasVolumes && <>Les variations de la semaine s&apos;équilibrent : impact net nul sur vos volumes renseignés.</>}
        </div>
        {hasVolumes && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {impacts.filter(i => i.volume > 0).map(i => (
              <div key={i.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1F1A4A', borderRadius: 8, padding: '9px 13px', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#D3D1C7' }}>{i.nom}</div>
                  <div style={{ fontSize: 10, color: '#8f8ac4', marginTop: 2 }}>{i.volume.toLocaleString('fr-FR')} €/mois</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <PillVariation pct={i.variation_pct} periode={i.periode} />
                  <div style={{ fontSize: 13, fontWeight: 500, color: i.impact > 0 ? '#F09595' : i.impact < 0 ? '#97C459' : '#AFA9EC', minWidth: 52, textAlign: 'right' }}>
                    {i.impact > 0 ? '+' : ''}{i.impact === 0 ? '= 0 €' : i.impact + ' €'}
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 13px', borderTop: '0.5px solid #3C3489', marginTop: 2 }}>
              <div style={{ fontSize: 12, color: '#AFA9EC', fontWeight: 500 }}>Variation nette estimée</div>
              <div style={{ fontSize: 16, fontWeight: 500, color: totalImpact > 0 ? '#F09595' : totalImpact < 0 ? '#97C459' : '#AFA9EC' }}>
                {totalImpact > 0 ? '+' : ''}{totalImpact} € / semaine
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA conversion */}
      <div style={{ background: 'linear-gradient(135deg, #26215C 0%, #3C3489 100%)', borderRadius: 13, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', marginBottom: 4 }}>Recevez ce calcul chaque semaine, automatiquement</div>
          <div style={{ fontSize: 12, color: '#AFA9EC', lineHeight: 1.6 }}>
            Créez votre profil établissement — HoReCa.Watch recalcule l&apos;impact sur vos volumes réels et vous alerte dès qu&apos;un seuil est franchi.
          </div>
        </div>
        <NavSignupButton label="Créer mon profil gratuit" />
      </div>
    </div>
  )
}
