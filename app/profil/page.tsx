'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  IconBuildingStore, IconShoppingCart, IconBell,
  IconMeat, IconEgg, IconCoffee, IconWheat, IconDroplet, IconBolt,
  IconArrowLeft,
} from '@tabler/icons-react'
import { createClient } from '@/lib/supabase/client'

const regions = [
  'Île-de-France', 'Auvergne-Rhône-Alpes', 'Provence-Alpes-Côte d\'Azur',
  'Occitanie', 'Grand Est', 'Bretagne', 'Nouvelle-Aquitaine', 'Autre',
]

const typeEtablissements = [
  'Restaurant traditionnel', 'Hôtel-restaurant', 'Brasserie',
  'Restauration rapide', 'Traiteur / Collectivité', 'Bar / Café',
]

// Indicateurs marché pour le calcul (semaine 21 S21 mock)
const indicateursMarch = [
  { key: 'vol_cafe',     nom: 'Café arabica',     variation_pct:  11.2 },
  { key: 'vol_viandes',  nom: 'Viande bovine',     variation_pct:   4.7 },
  { key: 'vol_laitiers', nom: 'Produits laitiers', variation_pct:   3.1 },
  { key: 'vol_energie',  nom: 'Électricité spot',  variation_pct:  -6.1 },
  { key: 'vol_huiles',   nom: 'Huile tournesol',   variation_pct:  -2.8 },
  { key: 'vol_farine',   nom: 'Farine T55',        variation_pct:   0   },
]

type Volumes = {
  vol_viandes:  number
  vol_laitiers: number
  vol_cafe:     number
  vol_farine:   number
  vol_huiles:   number
  vol_energie:  number
}

const defaultVolumes: Volumes = {
  vol_viandes:  1200,
  vol_laitiers:  480,
  vol_cafe:      320,
  vol_farine:    210,
  vol_huiles:    150,
  vol_energie:   900,
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{ width: 38, height: 22, borderRadius: 11, display: 'flex', alignItems: 'center', padding: 2, cursor: 'pointer', background: on ? '#26215C' : '#D3D1C7', justifyContent: on ? 'flex-end' : 'flex-start', flexShrink: 0, transition: 'background 0.2s' }}
    >
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff' }} />
    </div>
  )
}

export default function ProfilPage() {
  const [type, setType] = useState('Restaurant traditionnel')
  const [couverts, setCouverts] = useState('80')
  const [chambres, setChambres] = useState('')
  const [region, setRegion] = useState('Grand Est')
  const [fournisseurs, setFournisseurs] = useState('')
  const [volumes, setVolumes] = useState<Volumes>(defaultVolumes)
  const [alerts, setAlerts] = useState({ surcout: true, geopolitique: true, reglementation: true, pdf: false })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoadingProfile(false); return }
      const { data: profil } = await supabase
        .from('etablissements')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (profil) {
        setType(profil.type_etablissement || 'Restaurant traditionnel')
        setCouverts(String(profil.couverts_par_jour || ''))
        setChambres(String(profil.nombre_chambres || ''))
        setRegion(profil.region || 'Grand Est')
        setFournisseurs(profil.fournisseurs || '')
        setVolumes({
          vol_viandes:  profil.vol_viandes  || 0,
          vol_laitiers: profil.vol_laitiers || 0,
          vol_cafe:     profil.vol_cafe     || 0,
          vol_farine:   profil.vol_farine   || 0,
          vol_huiles:   profil.vol_huiles   || 0,
          vol_energie:  profil.vol_energie  || 0,
        })
        setAlerts({
          surcout:       profil.alert_surcout        ?? true,
          geopolitique:  profil.alert_geopolitique   ?? true,
          reglementation: profil.alert_reglementation ?? true,
          pdf:           profil.alert_rapport_pdf    ?? false,
        })
      }
      setLoadingProfile(false)
    }
    loadProfile()
  }, [])

  const impacts = useMemo(() => {
    return indicateursMarch.map(ind => {
      const vol = volumes[ind.key as keyof Volumes] || 0
      return {
        nom: ind.nom,
        variation_pct: ind.variation_pct,
        volume: vol,
        impact: Math.round(vol * ind.variation_pct / 100),
      }
    })
  }, [volumes])

  const totalImpact = useMemo(() => impacts.reduce((sum, i) => sum + i.impact, 0), [impacts])

  function setVol(key: keyof Volumes, val: string) {
    setVolumes(prev => ({ ...prev, [key]: parseFloat(val) || 0 }))
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('etablissements').upsert({
        user_id: user.id,
        type_etablissement: type,
        couverts_par_jour: parseInt(couverts) || null,
        nombre_chambres: chambres ? parseInt(chambres) : null,
        region,
        fournisseurs: fournisseurs || null,
        ...volumes,
        alert_surcout: alerts.surcout,
        alert_geopolitique: alerts.geopolitique,
        alert_reglementation: alerts.reglementation,
        alert_rapport_pdf: alerts.pdf,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const volFields: { key: keyof Volumes; label: string; Icon: React.ElementType }[] = [
    { key: 'vol_viandes',  label: 'Viandes',                  Icon: IconMeat },
    { key: 'vol_laitiers', label: 'Produits laitiers & œufs', Icon: IconEgg },
    { key: 'vol_cafe',     label: 'Café & boissons chaudes',  Icon: IconCoffee },
    { key: 'vol_farine',   label: 'Farine & pâtisserie',      Icon: IconWheat },
    { key: 'vol_huiles',   label: 'Huiles & matières grasses', Icon: IconDroplet },
    { key: 'vol_energie',  label: 'Énergie (élec + gaz)',     Icon: IconBolt },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F8F8FC' }}>
      {/* TOPBAR */}
      <div style={{ background: '#26215C', padding: '11px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: 16, fontWeight: 500, color: '#fff', letterSpacing: '-0.02em', textDecoration: 'none' }}>
          HoReCa<span style={{ color: '#AFA9EC' }}>.</span>Watch
        </Link>
        <Link href="/dashboard" style={{ fontSize: 13, color: '#D3D1C7', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <IconArrowLeft size={14} />
          Retour au dashboard
        </Link>
      </div>

      <div style={{ padding: 24, maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Page header */}
        <div style={{ paddingTop: 4 }}>
          <div style={{ fontSize: 22, fontWeight: 500, color: '#26215C', marginBottom: 6 }}>Mon établissement</div>
          <div style={{ fontSize: 13, color: '#5F5E5A', lineHeight: 1.6 }}>
            Ces informations permettent à HoReCa.Watch de calculer l&apos;impact réel des variations de marché sur vos achats — pas des données génériques, mais votre situation exacte.
          </div>
        </div>

        {/* Infos générales */}
        <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#26215C', display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconBuildingStore size={17} color="#534AB7" /> Informations générales
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5F5E5A', fontWeight: 500 }}>Type d&apos;établissement</label>
              <select value={type} onChange={e => setType(e.target.value)} style={{ fontSize: 13, padding: '9px 11px', borderRadius: 8, border: '0.5px solid #CECBF6', background: '#F8F8FC', color: '#26215C', width: '100%' }}>
                {typeEtablissements.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5F5E5A', fontWeight: 500 }}>Couverts par jour (moy.)</label>
              <input type="number" value={couverts} onChange={e => setCouverts(e.target.value)} placeholder="ex. 80" style={{ fontSize: 13, padding: '9px 11px', borderRadius: 8, border: '0.5px solid #CECBF6', background: '#F8F8FC', color: '#26215C', width: '100%' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5F5E5A', fontWeight: 500 }}>Nombre de chambres</label>
              <input type="number" value={chambres} onChange={e => setChambres(e.target.value)} placeholder="Si hôtel — laisser vide sinon" style={{ fontSize: 13, padding: '9px 11px', borderRadius: 8, border: '0.5px solid #CECBF6', background: '#F8F8FC', color: '#26215C', width: '100%' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5F5E5A', fontWeight: 500 }}>Région</label>
              <select value={region} onChange={e => setRegion(e.target.value)} style={{ fontSize: 13, padding: '9px 11px', borderRadius: 8, border: '0.5px solid #CECBF6', background: '#F8F8FC', color: '#26215C', width: '100%' }}>
                {regions.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, gridColumn: 'span 2' }}>
              <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5F5E5A', fontWeight: 500 }}>Fournisseurs principaux (optionnel)</label>
              <input type="text" value={fournisseurs} onChange={e => setFournisseurs(e.target.value)} placeholder="ex. Transgourmet, Metro, Sysco France, grossiste local..." style={{ fontSize: 13, padding: '9px 11px', borderRadius: 8, border: '0.5px solid #CECBF6', background: '#F8F8FC', color: '#26215C', width: '100%' }} />
            </div>
          </div>
        </div>

        {/* Volumes d'achats */}
        <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#26215C', display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconShoppingCart size={17} color="#534AB7" /> Volumes d&apos;achats mensuels
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {volFields.map(f => (
              <div key={f.key} style={{ background: '#F8F8FC', border: '0.5px solid #CECBF6', borderRadius: 9, padding: '11px 13px' }}>
                <div style={{ fontSize: 11, color: '#5F5E5A', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                  <f.Icon size={14} color="#534AB7" /> {f.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <input
                    type="number"
                    value={volumes[f.key] || ''}
                    onChange={e => setVol(f.key, e.target.value)}
                    style={{ fontSize: 18, fontWeight: 500, color: '#26215C', border: 'none', background: 'transparent', width: 90, padding: 0, outline: 'none' }}
                  />
                  <span style={{ fontSize: 11, color: '#888780' }}>€ / mois</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Impact calculé */}
        <div style={{ background: '#26215C', borderRadius: 13, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#AFA9EC', fontWeight: 500 }}>Impact estimé cette semaine</div>
            <div style={{ fontSize: 10, color: '#534AB7' }}>Semaine 21 · 2026</div>
          </div>
          <div style={{ fontSize: 13, color: '#D3D1C7', lineHeight: 1.7 }}>
            {totalImpact > 0 && <>Basé sur vos volumes, les variations de marché représentent un <strong style={{ color: '#F09595' }}>surcoût estimé de +{totalImpact} € ce mois</strong>.</>}
            {totalImpact < 0 && <>Basé sur vos volumes, les variations de marché représentent une <span style={{ color: '#97C459' }}>économie estimée de {totalImpact} € ce mois</span>.</>}
            {totalImpact === 0 && <>Basé sur vos volumes, les variations de marché ont un impact neutre ce mois.</>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {impacts.filter(i => i.volume > 0).map(i => (
              <div key={i.nom} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1F1A4A', borderRadius: 8, padding: '9px 13px' }}>
                <div style={{ fontSize: 12, color: '#D3D1C7' }}>
                  {i.nom} ({i.variation_pct > 0 ? '+' : ''}{i.variation_pct === 0 ? 'stable' : i.variation_pct.toFixed(1) + '%'} · {i.volume.toLocaleString('fr-FR')} €/mois)
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: i.impact > 0 ? '#F09595' : i.impact < 0 ? '#97C459' : '#AFA9EC' }}>
                  {i.impact > 0 ? '+' : ''}{i.impact === 0 ? '= 0 €' : i.impact + ' €'}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 13px', borderTop: '0.5px solid #3C3489', marginTop: 2 }}>
            <div style={{ fontSize: 12, color: '#AFA9EC', fontWeight: 500 }}>Variation nette estimée</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: totalImpact > 0 ? '#F09595' : totalImpact < 0 ? '#97C459' : '#AFA9EC' }}>
              {totalImpact > 0 ? '+' : ''}{totalImpact} € / mois
            </div>
          </div>
        </div>

        {/* Alertes */}
        <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#26215C', display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconBell size={17} color="#534AB7" /> Alertes personnalisées pour mon établissement
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {[
              { key: 'surcout',       name: 'Surcoût mensuel estimé supérieur à 200 €',        sub: 'Email dès que l\'impact cumulé dépasse votre seuil personnalisé' },
              { key: 'geopolitique',  name: 'Signal géopolitique sur un produit que j\'achète', sub: 'Notification anticipée 4–6 semaines avant la hausse probable' },
              { key: 'reglementation', name: 'Nouvelle réglementation CHR applicable',          sub: 'Résumé + délai de mise en conformité dès publication au JO' },
              { key: 'pdf',           name: 'Rapport mensuel personnalisé en PDF',              sub: 'Récapitulatif complet avec impact calculé sur vos achats réels' },
            ].map(a => (
              <div key={a.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 14px', background: '#F8F8FC', border: '0.5px solid #CECBF6', borderRadius: 9 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#26215C' }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: '#888780', lineHeight: 1.4, marginTop: 2 }}>{a.sub}</div>
                </div>
                <Toggle
                  on={alerts[a.key as keyof typeof alerts]}
                  onToggle={() => setAlerts(prev => ({ ...prev, [a.key]: !prev[a.key as keyof typeof alerts] }))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ background: saved ? '#1D9E75' : '#26215C', color: '#fff', fontSize: 14, fontWeight: 500, padding: 13, borderRadius: 10, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', textAlign: 'center', transition: 'background 0.2s' }}
        >
          {saving ? 'Enregistrement…' : saved ? '✓ Profil enregistré' : 'Enregistrer mon profil'}
        </button>

        <div style={{ fontSize: 11, color: '#888780', textAlign: 'center', lineHeight: 1.5, paddingBottom: 8 }}>
          Vos données sont privées et ne sont jamais partagées avec des tiers.<br />
          Elles sont utilisées uniquement pour le calcul d&apos;impact sur votre établissement.
        </div>
      </div>
    </div>
  )
}
