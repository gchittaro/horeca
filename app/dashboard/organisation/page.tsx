'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  IconBuildingStore, IconMail, IconTrash, IconPlus, IconUsers, IconPencil,
  IconShoppingCart, IconMeat, IconEgg, IconCoffee, IconWheat, IconDroplet, IconBolt,
  IconAlertTriangle, IconRefresh,
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
  vol_viandes: 0, vol_laitiers: 0, vol_cafe: 0,
  vol_farine:  0, vol_huiles:   0, vol_energie: 0,
}

function calculerPrixMensuel(nbUsers: number): number {
  const BASE = 19
  if (nbUsers <= 1) return BASE
  const prixParUser = Math.max(BASE - (nbUsers - 1), 11)
  return Math.round(prixParUser * nbUsers)
}

const SECTIONS = [
  { key: 'food',         label: 'Alimentation' },
  { key: 'boissons',     label: 'Boissons' },
  { key: 'energie',      label: 'Énergie' },
  { key: 'rh',           label: 'RH' },
  { key: 'juridique',    label: 'Juridique' },
  { key: 'geopolitique', label: 'Géopolitique' },
]
const ALL_SECTIONS = SECTIONS.map(s => s.key)

type Org    = { id: string; nom: string; plan: string; created_at: string }
type Member = { id: string; user_id: string | null; role: string; invited_email: string | null; joined_at: string; sections: string[] | null }

function Badge({ role }: { role: string }) {
  const isOwner = role === 'owner'
  return (
    <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: isOwner ? '#26215C' : '#EEEDFE', color: isOwner ? '#AFA9EC' : '#534AB7' }}>
      {isOwner ? 'Propriétaire' : 'Membre'}
    </span>
  )
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span style={{ fontSize: 10, color: active ? '#1D9E75' : '#888780', display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#1D9E75' : '#D3D1C7', display: 'inline-block' }} />
      {active ? 'Actif' : 'Invitation en attente'}
    </span>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5F5E5A', fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  fontSize: 13, padding: '9px 11px', borderRadius: 8,
  border: '0.5px solid #CECBF6', background: '#F8F8FC',
  color: '#26215C', width: '100%', outline: 'none',
}

type Tab = 'etab' | 'volumes' | 'equipe'

export default function OrganisationPage() {
  const [tab, setTab] = useState<Tab>('etab')

  // Organisation
  const [org,         setOrg]         = useState<Org | null>(null)
  const [members,     setMembers]     = useState<Member[]>([])
  const [orgName,     setOrgName]     = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [userEmail,   setUserEmail]   = useState('')
  const [maxUsers,    setMaxUsers]    = useState(1)
  const [loading,     setLoading]     = useState(true)
  const [creating,    setCreating]    = useState(false)
  const [inviting,    setInviting]    = useState(false)
  const [orgError,    setOrgError]    = useState('')
  const [orgSuccess,  setOrgSuccess]  = useState('')
  const [inviteSections, setInviteSections] = useState<string[]>(ALL_SECTIONS)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [editSections,    setEditSections]    = useState<string[]>([])

  // Modale confirmation siège
  const [seatModal, setSeatModal] = useState<{ email: string; prixActuel: number; prixNouveau: number } | null>(null)
  const [seatLoading, setSeatLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // Établissement
  const [nomEtablissement, setNomEtablissement] = useState('')
  const [siret,     setSiret]     = useState('')
  const [adresse,   setAdresse]   = useState('')
  const [ville,     setVille]     = useState('')
  const [codePostal,setCodePostal]= useState('')
  const [type,      setType]      = useState('Restaurant traditionnel')
  const [couverts,  setCouverts]  = useState('')
  const [chambres,  setChambres]  = useState('')
  const [region,    setRegion]    = useState('Grand Est')
  const [fournisseurs, setFournisseurs] = useState('')
  const [volumes,   setVolumes]   = useState<Volumes>(defaultVolumes)
  const [etabSaving, setEtabSaving] = useState(false)
  const [etabSaved,  setEtabSaved]  = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    setUserEmail(user.email ?? '')

    const [{ data: orgData }, { data: profil }] = await Promise.all([
      supabase.from('organisations').select('*').eq('owner_id', user.id).single(),
      supabase.from('etablissements').select('*').eq('user_id', user.id).single(),
    ])

    if (orgData) {
      setOrg(orgData)
      const { data: membersData } = await supabase
        .from('organisation_members').select('*').eq('org_id', orgData.id).order('joined_at')
      setMembers(membersData ?? [])
    }

    if (profil) {
      setNomEtablissement(profil.nom_etablissement || '')
      if (!orgData) setOrgName(profil.nom_etablissement || '')
      setSiret(profil.siret || '')
      setAdresse(profil.adresse || '')
      setVille(profil.ville || '')
      setCodePostal(profil.code_postal || '')
      setType(profil.type_etablissement || 'Restaurant traditionnel')
      setCouverts(String(profil.couverts_par_jour || ''))
      setChambres(String(profil.nombre_chambres || ''))
      setRegion(profil.region || 'Grand Est')
      setFournisseurs(profil.fournisseurs || '')
      setMaxUsers(profil.max_users || 1)
      setVolumes({
        vol_viandes:  profil.vol_viandes  || 0,
        vol_laitiers: profil.vol_laitiers || 0,
        vol_cafe:     profil.vol_cafe     || 0,
        vol_farine:   profil.vol_farine   || 0,
        vol_huiles:   profil.vol_huiles   || 0,
        vol_energie:  profil.vol_energie  || 0,
      })
    }
    setLoading(false)
  }

  const impacts = useMemo(() => indicateursMarch.map(ind => {
    const vol = volumes[ind.key as keyof Volumes] || 0
    return { nom: ind.nom, variation_pct: ind.variation_pct, volume: vol, impact: Math.round(vol * ind.variation_pct / 100) }
  }), [volumes])

  const totalImpact = useMemo(() => impacts.reduce((sum, i) => sum + i.impact, 0), [impacts])

  function setVol(key: keyof Volumes, val: string) {
    setVolumes(prev => ({ ...prev, [key]: parseFloat(val) || 0 }))
  }

  async function handleSaveEtablissement() {
    setEtabSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('etablissements').upsert({
        user_id: user.id,
        nom_etablissement: nomEtablissement || null,
        siret: siret || null,
        adresse: adresse || null,
        ville: ville || null,
        code_postal: codePostal || null,
        type_etablissement: type,
        couverts_par_jour: parseInt(couverts) || null,
        nombre_chambres: chambres ? parseInt(chambres) : null,
        region,
        fournisseurs: fournisseurs || null,
        ...volumes,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
    }
    setEtabSaving(false)
    setEtabSaved(true)
    setTimeout(() => setEtabSaved(false), 3000)
  }

  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault()
    if (!orgName.trim()) return
    setCreating(true)
    setOrgError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setCreating(false); return }
    const { data, error: err } = await supabase
      .from('organisations').insert({ nom: orgName.trim(), owner_id: user.id, plan: 'pro' }).select().single()
    if (err) { setOrgError(err.message); setCreating(false); return }
    await supabase.from('organisation_members').insert({
      org_id: data.id, user_id: user.id, role: 'owner', invited_email: user.email,
    })
    setCreating(false)
    setOrgName('')
    await loadData()
  }

  // Étape 1 : vérifier si un siège est disponible ou ouvrir la modale
  function handleInviteClick(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim() || !org) return
    const alreadyInvited = members.some(m => m.invited_email?.toLowerCase() === inviteEmail.trim().toLowerCase())
    if (alreadyInvited) { setOrgError('Cet email a déjà été invité.'); return }

    // Siège disponible → inviter directement sans passer par Stripe
    if (members.length < maxUsers) {
      handleDirectInvite(inviteEmail.trim().toLowerCase())
      return
    }

    // Plus de sièges → demander confirmation + facturation
    const prixActuel  = calculerPrixMensuel(maxUsers)
    const prixNouveau = calculerPrixMensuel(maxUsers + 1)
    setSeatModal({ email: inviteEmail.trim().toLowerCase(), prixActuel, prixNouveau })
  }

  // Invitation directe (siège disponible, pas de Stripe)
  async function handleDirectInvite(email: string) {
    if (!org) return
    setInviting(true)
    setOrgError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('organisation_members').insert({
      org_id: org.id, user_id: null, role: 'member', invited_email: email,
      sections: inviteSections,
    })
    if (err) {
      setOrgError('Une erreur est survenue lors de l\'invitation.')
    } else {
      fetch('/api/loops/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, orgName: org.nom }),
      }).catch(() => {})
      setOrgSuccess(`Invitation envoyée à ${email}`)
      setInviteEmail('')
      setInviteSections(ALL_SECTIONS)
      await loadData()
      setTimeout(() => setOrgSuccess(''), 4000)
    }
    setInviting(false)
  }

  // Étape 2 : confirmer → mettre à jour Stripe + inviter
  async function handleConfirmInvite() {
    if (!seatModal || !org) return
    setSeatLoading(true)
    setOrgError('')

    // Mettre à jour les sièges Stripe
    const newMax = maxUsers + 1
    const res = await fetch('/api/stripe/update-seats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newQuantity: newMax }),
    })
    if (!res.ok) {
      const data = await res.json()
      setOrgError(data.error || 'Erreur lors de la mise à jour de l\'abonnement.')
      setSeatLoading(false)
      setSeatModal(null)
      return
    }
    setMaxUsers(newMax)

    // Ajouter le membre
    const supabase = createClient()
    const { error: err } = await supabase.from('organisation_members').insert({
      org_id: org.id, user_id: null, role: 'member',
      invited_email: seatModal.email,
      sections: inviteSections,
    })
    if (err) {
      setOrgError('Une erreur est survenue lors de l\'invitation.')
    } else {
      fetch('/api/loops/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: seatModal.email, orgName: org.nom }),
      }).catch(() => {})
      setOrgSuccess(`Invitation envoyée à ${seatModal.email}`)
      setInviteEmail('')
      await loadData()
      setTimeout(() => setOrgSuccess(''), 4000)
    }
    setSeatLoading(false)
    setSeatModal(null)
  }

  async function handleUpdateSections(memberId: string) {
    const supabase = createClient()
    await supabase.from('organisation_members').update({ sections: editSections }).eq('id', memberId)
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, sections: editSections } : m))
    setEditingMemberId(null)
  }

  async function handleRemove(memberId: string, memberRole: string) {
    if (memberRole === 'owner') return
    const supabase = createClient()
    await supabase.from('organisation_members').delete().eq('id', memberId)
    const newMax = Math.max(1, maxUsers - 1)
    // Réduire le siège Stripe silencieusement
    fetch('/api/stripe/update-seats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newQuantity: newMax }),
    }).catch(() => {})
    setMaxUsers(newMax)
    setMembers(prev => prev.filter(m => m.id !== memberId))
  }

  async function handleSyncSeats() {
    setSyncing(true)
    const res = await fetch('/api/stripe/sync-seats', { method: 'POST' })
    const data = await res.json()
    if (data.max_users) setMaxUsers(data.max_users)
    setSyncing(false)
  }

  const volFields: { key: keyof Volumes; label: string; Icon: React.ElementType }[] = [
    { key: 'vol_viandes',  label: 'Viandes',                   Icon: IconMeat },
    { key: 'vol_laitiers', label: 'Produits laitiers & œufs',  Icon: IconEgg },
    { key: 'vol_cafe',     label: 'Café & boissons chaudes',   Icon: IconCoffee },
    { key: 'vol_farine',   label: 'Farine & pâtisserie',       Icon: IconWheat },
    { key: 'vol_huiles',   label: 'Huiles & matières grasses', Icon: IconDroplet },
    { key: 'vol_energie',  label: 'Énergie (élec + gaz)',      Icon: IconBolt },
  ]

  if (loading) return <div style={{ padding: '48px 24px', textAlign: 'center', color: '#AFA9EC', fontSize: 13 }}>Chargement…</div>

  const tabs: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: 'etab',    label: 'Informations',     Icon: IconBuildingStore },
    { id: 'volumes', label: 'Volumes & Impact', Icon: IconShoppingCart },
    { id: 'equipe',  label: 'Équipe',           Icon: IconUsers },
  ]

  return (
    <div style={{ padding: '18px 24px', maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#26215C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconBuildingStore size={20} color="#AFA9EC" />
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 500, color: '#26215C' }}>Mon entreprise</div>
          <div style={{ fontSize: 12, color: '#888780' }}>Établissement, volumes d&apos;achats et équipe</div>
        </div>
      </div>

      {/* Sous-onglets */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '0.5px solid #CECBF6' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: tab === t.id ? 500 : 400,
              color: tab === t.id ? '#26215C' : '#888780',
              background: 'none', border: 'none', borderBottom: tab === t.id ? '2px solid #26215C' : '2px solid transparent',
              padding: '10px 18px', cursor: 'pointer', marginBottom: -1,
              transition: 'color 0.15s',
            }}
          >
            <t.Icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ONGLET 1 : INFORMATIONS ── */}
      {tab === 'etab' && (
        <>
          <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#26215C', display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconBuildingStore size={17} color="#534AB7" /> Informations établissement
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Nom de l'établissement">
                <input type="text" value={nomEtablissement} onChange={e => setNomEtablissement(e.target.value)} placeholder="Le Bistrot du Marché" style={inputStyle} />
              </Field>
              <Field label="SIRET">
                <input type="text" value={siret} onChange={e => setSiret(e.target.value)} placeholder="123 456 789 00012" style={inputStyle} maxLength={17} />
              </Field>
              <Field label="Adresse">
                <input type="text" value={adresse} onChange={e => setAdresse(e.target.value)} placeholder="12 rue de la Paix" style={inputStyle} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 8 }}>
                <Field label="Code postal">
                  <input type="text" value={codePostal} onChange={e => setCodePostal(e.target.value)} placeholder="67000" style={inputStyle} maxLength={5} />
                </Field>
                <Field label="Ville">
                  <input type="text" value={ville} onChange={e => setVille(e.target.value)} placeholder="Strasbourg" style={inputStyle} />
                </Field>
              </div>
              <Field label="Type d'établissement">
                <select value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
                  {typeEtablissements.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Région">
                <select value={region} onChange={e => setRegion(e.target.value)} style={inputStyle}>
                  {regions.map(r => <option key={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Couverts par jour (moy.)">
                <input type="number" value={couverts} onChange={e => setCouverts(e.target.value)} placeholder="80" style={inputStyle} />
              </Field>
              <Field label="Nombre de chambres">
                <input type="number" value={chambres} onChange={e => setChambres(e.target.value)} placeholder="Si hôtel — laisser vide sinon" style={inputStyle} />
              </Field>
              <div style={{ gridColumn: 'span 2' }}>
                <Field label="Fournisseurs principaux (optionnel)">
                  <input type="text" value={fournisseurs} onChange={e => setFournisseurs(e.target.value)} placeholder="Transgourmet, Metro, Sysco France…" style={inputStyle} />
                </Field>
              </div>
            </div>
          </div>
          <button
            onClick={handleSaveEtablissement}
            disabled={etabSaving}
            style={{ background: etabSaved ? '#1D9E75' : '#26215C', color: '#fff', fontSize: 14, fontWeight: 500, padding: 13, borderRadius: 10, border: 'none', cursor: etabSaving ? 'not-allowed' : 'pointer', textAlign: 'center', transition: 'background 0.2s' }}
          >
            {etabSaving ? 'Enregistrement…' : etabSaved ? '✓ Informations enregistrées' : 'Enregistrer'}
          </button>
        </>
      )}

      {/* ── ONGLET 2 : VOLUMES & IMPACT ── */}
      {tab === 'volumes' && (
        <>
          <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#26215C', display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconShoppingCart size={17} color="#534AB7" /> Volumes d&apos;achats mensuels
            </div>
            <div style={{ fontSize: 12, color: '#888780', lineHeight: 1.5, marginTop: -8 }}>
              Renseignez vos dépenses moyennes pour calculer l&apos;impact des variations de marché sur votre établissement.
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
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#AFA9EC', fontWeight: 500 }}>
              Impact estimé ce mois
            </div>
            <div style={{ fontSize: 13, color: '#D3D1C7', lineHeight: 1.7 }}>
              {totalImpact > 0 && <>Basé sur vos volumes, les variations représentent un <strong style={{ color: '#F09595' }}>surcoût estimé de +{totalImpact} € ce mois</strong>.</>}
              {totalImpact < 0 && <>Basé sur vos volumes, les variations représentent une <span style={{ color: '#97C459' }}>économie estimée de {Math.abs(totalImpact)} € ce mois</span>.</>}
              {totalImpact === 0 && <>Renseignez vos volumes pour calculer l&apos;impact sur votre établissement.</>}
            </div>
            {impacts.filter(i => i.volume > 0).length > 0 && (
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 13px', borderTop: '0.5px solid #3C3489', marginTop: 2 }}>
                  <div style={{ fontSize: 12, color: '#AFA9EC', fontWeight: 500 }}>Variation nette estimée</div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: totalImpact > 0 ? '#F09595' : totalImpact < 0 ? '#97C459' : '#AFA9EC' }}>
                    {totalImpact > 0 ? '+' : ''}{totalImpact} € / mois
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSaveEtablissement}
            disabled={etabSaving}
            style={{ background: etabSaved ? '#1D9E75' : '#26215C', color: '#fff', fontSize: 14, fontWeight: 500, padding: 13, borderRadius: 10, border: 'none', cursor: etabSaving ? 'not-allowed' : 'pointer', textAlign: 'center', transition: 'background 0.2s' }}
          >
            {etabSaving ? 'Enregistrement…' : etabSaved ? '✓ Volumes enregistrés' : 'Enregistrer les volumes'}
          </button>
        </>
      )}

      {/* ── ONGLET 3 : ÉQUIPE ── */}
      {tab === 'equipe' && (
        <>
          {!org ? (
            <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13, padding: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#26215C', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconUsers size={16} color="#534AB7" /> Nommer votre équipe
              </div>
              <div style={{ fontSize: 12, color: '#888780', marginBottom: 14, lineHeight: 1.5 }}>
                Donnez un nom à votre équipe pour commencer à inviter des collaborateurs.
              </div>
              <form onSubmit={handleCreateOrg} style={{ display: 'flex', gap: 10 }}>
                <input
                  type="text" value={orgName} onChange={e => setOrgName(e.target.value)}
                  placeholder="ex : Groupe Dupont, Hôtel du Parc…" required
                  style={{ flex: 1, fontSize: 13, padding: '10px 12px', borderRadius: 8, border: '0.5px solid #CECBF6', background: '#F8F8FC', color: '#26215C', outline: 'none' }}
                />
                <button
                  type="submit" disabled={creating || !orgName.trim()}
                  style={{ fontSize: 13, fontWeight: 500, background: '#26215C', color: '#fff', padding: '10px 20px', borderRadius: 8, border: 'none', cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1, whiteSpace: 'nowrap' }}
                >
                  {creating ? 'Création…' : 'Créer l\'équipe'}
                </button>
              </form>
              {orgError && <div style={{ fontSize: 12, color: '#A32D2D', marginTop: 10 }}>{orgError}</div>}
            </div>
          ) : (
            <>
              {/* Infos org + compteur sièges */}
              <div style={{ background: '#26215C', borderRadius: 13, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#fff', marginBottom: 4 }}>{org.nom}</div>
                  <div style={{ fontSize: 11, color: '#AFA9EC', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span>{members.length} / {maxUsers} siège{maxUsers > 1 ? 's' : ''} utilisé{members.length > 1 ? 's' : ''}</span>
                    <span>·</span>
                    <span>{calculerPrixMensuel(maxUsers)} €/mois</span>
                    {members.length < maxUsers && (
                      <>
                        <span>·</span>
                        <span style={{ color: '#1D9E75' }}>{maxUsers - members.length} siège{maxUsers - members.length > 1 ? 's' : ''} disponible{maxUsers - members.length > 1 ? 's' : ''}</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleSyncSeats}
                  disabled={syncing}
                  title="Synchroniser les sièges avec Stripe"
                  style={{ background: '#1F1A4A', border: 'none', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: syncing ? 'not-allowed' : 'pointer', opacity: syncing ? 0.5 : 1, flexShrink: 0 }}
                >
                  <IconRefresh size={15} color="#AFA9EC" style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
                </button>
              </div>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

              {/* Membres */}
              <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#26215C', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconUsers size={16} color="#534AB7" /> Membres ({members.length})
                </div>
                {members.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#888780', textAlign: 'center', padding: '16px 0' }}>
                    Aucun membre pour l&apos;instant. Invitez vos collaborateurs ci-dessous.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {members.map(m => (
                      <div key={m.id} style={{ background: '#F8F8FC', border: '0.5px solid #CECBF6', borderRadius: 9, padding: '11px 14px' }}>
                        {/* Ligne principale */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: m.role === 'owner' ? '#26215C' : '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: m.role === 'owner' ? '#AFA9EC' : '#534AB7' }}>
                                {(m.invited_email ?? '?')[0].toUpperCase()}
                              </span>
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 500, color: '#26215C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {m.invited_email ?? '—'}
                                {m.invited_email?.toLowerCase() === userEmail.toLowerCase() && (
                                  <span style={{ fontSize: 10, color: '#888780', marginLeft: 6 }}>(vous)</span>
                                )}
                              </div>
                              <StatusDot active={m.user_id !== null} />
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                            <Badge role={m.role} />
                            {m.role !== 'owner' && (
                              <>
                                <button
                                  onClick={() => { setEditingMemberId(editingMemberId === m.id ? null : m.id); setEditSections(m.sections ?? ALL_SECTIONS) }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: editingMemberId === m.id ? '#26215C' : '#534AB7' }}
                                  title="Modifier les sections"
                                >
                                  <IconPencil size={14} />
                                </button>
                                <button
                                  onClick={() => handleRemove(m.id, m.role)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: '#C06060' }}
                                  title="Retirer ce membre"
                                >
                                  <IconTrash size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Sections */}
                        {m.role !== 'owner' && (
                          editingMemberId === m.id ? (
                            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid #EEEDFE' }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                                {SECTIONS.map(s => {
                                  const checked = editSections.includes(s.key)
                                  return (
                                    <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: checked ? '#26215C' : '#888780', background: checked ? '#EEEDFE' : '#fff', border: `0.5px solid ${checked ? '#AFA9EC' : '#CECBF6'}`, borderRadius: 20, padding: '3px 9px', cursor: 'pointer', userSelect: 'none' }}>
                                      <input type="checkbox" checked={checked} onChange={() => setEditSections(prev => checked ? prev.filter(k => k !== s.key) : [...prev, s.key])} style={{ display: 'none' }} />
                                      {s.label}
                                    </label>
                                  )
                                })}
                              </div>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => handleUpdateSections(m.id)} style={{ fontSize: 12, background: '#534AB7', color: '#fff', padding: '5px 14px', borderRadius: 7, border: 'none', cursor: 'pointer' }}>Enregistrer</button>
                                <button onClick={() => setEditingMemberId(null)} style={{ fontSize: 12, background: 'none', color: '#888780', padding: '5px 10px', borderRadius: 7, border: '0.5px solid #CECBF6', cursor: 'pointer' }}>Annuler</button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {(m.sections ?? ALL_SECTIONS).map(k => {
                                const s = SECTIONS.find(s => s.key === k)
                                return s ? <span key={k} style={{ fontSize: 10, color: '#534AB7', background: '#EEEDFE', padding: '2px 8px', borderRadius: 20 }}>{s.label}</span> : null
                              })}
                            </div>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Inviter */}
              <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#26215C', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconMail size={16} color="#534AB7" /> Inviter un collaborateur
                </div>
                <div style={{ fontSize: 12, color: '#888780', marginBottom: 14, lineHeight: 1.5 }}>
                  L&apos;ajout d&apos;un siège sera facturé immédiatement au prorata sur votre prochaine facture Stripe.
                </div>
                <form onSubmit={handleInviteClick} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <IconMail size={14} color="#888780" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                        placeholder="collaborateur@etablissement.fr" required
                        style={{ fontSize: 13, padding: '10px 12px 10px 32px', borderRadius: 8, border: '0.5px solid #CECBF6', background: '#F8F8FC', color: '#26215C', outline: 'none', width: '100%' }}
                      />
                    </div>
                    <button
                      type="submit" disabled={inviting || !inviteEmail.trim() || inviteSections.length === 0}
                      style={{ fontSize: 13, fontWeight: 500, background: '#534AB7', color: '#fff', padding: '10px 18px', borderRadius: 8, border: 'none', cursor: inviting ? 'not-allowed' : 'pointer', opacity: (inviting || inviteSections.length === 0) ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
                    >
                      <IconPlus size={14} />
                      Inviter
                    </button>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#5F5E5A', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>Sections accessibles</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {SECTIONS.map(s => {
                        const checked = inviteSections.includes(s.key)
                        return (
                          <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: checked ? '#26215C' : '#888780', background: checked ? '#EEEDFE' : '#F8F8FC', border: `0.5px solid ${checked ? '#AFA9EC' : '#CECBF6'}`, borderRadius: 20, padding: '4px 10px', cursor: 'pointer', userSelect: 'none' }}>
                            <input
                              type="checkbox" checked={checked}
                              onChange={() => setInviteSections(prev => checked ? prev.filter(k => k !== s.key) : [...prev, s.key])}
                              style={{ display: 'none' }}
                            />
                            {s.label}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                </form>
                {orgError && <div style={{ fontSize: 12, color: '#A32D2D', background: '#FCEBEB', padding: '8px 12px', borderRadius: 8, marginTop: 10 }}>{orgError}</div>}
                {orgSuccess && <div style={{ fontSize: 12, color: '#1D6952', background: '#E1F5EE', padding: '8px 12px', borderRadius: 8, marginTop: 10 }}>{orgSuccess}</div>}
              </div>

              <div style={{ fontSize: 11, color: '#888780', textAlign: 'center', lineHeight: 1.6 }}>
                Pour dissoudre l&apos;organisation ou transférer la propriété, contactez le support.
              </div>
            </>
          )}
        </>
      )}

      {/* ── MODALE CONFIRMATION SIÈGE ── */}
      {seatModal && (
        <div
          onClick={() => !seatLoading && setSeatModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,12,40,0.6)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 14, padding: 28, maxWidth: 380, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: '#FAEEDA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IconAlertTriangle size={18} color="#BA7517" />
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#26215C' }}>Confirmer l&apos;ajout d&apos;un siège</div>
            </div>

            <div style={{ fontSize: 13, color: '#5F5E5A', lineHeight: 1.6 }}>
              Vous invitez <strong style={{ color: '#26215C' }}>{seatModal.email}</strong>.
            </div>

            <div style={{ background: '#F8F8FC', border: '0.5px solid #CECBF6', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888780' }}>
                <span>Abonnement actuel ({maxUsers} siège{maxUsers > 1 ? 's' : ''})</span>
                <span style={{ fontWeight: 500, color: '#26215C' }}>{seatModal.prixActuel} €/mois</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#26215C', paddingTop: 8, borderTop: '0.5px solid #E8E7F4' }}>
                <span style={{ fontWeight: 500 }}>Nouvel abonnement ({maxUsers + 1} sièges)</span>
                <span style={{ fontWeight: 600, color: '#26215C' }}>{seatModal.prixNouveau} €/mois</span>
              </div>
              <div style={{ fontSize: 11, color: '#BA7517', background: '#FAEEDA', padding: '6px 10px', borderRadius: 7, marginTop: 4 }}>
                +{seatModal.prixNouveau - seatModal.prixActuel} €/mois — proratisé sur votre prochaine facture
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setSeatModal(null)}
                disabled={seatLoading}
                style={{ flex: 1, fontSize: 13, fontWeight: 500, padding: '10px 0', borderRadius: 9, background: '#F0EFF9', color: '#534AB7', border: 'none', cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmInvite}
                disabled={seatLoading}
                style={{ flex: 1, fontSize: 13, fontWeight: 500, padding: '10px 0', borderRadius: 9, background: '#26215C', color: '#fff', border: 'none', cursor: seatLoading ? 'not-allowed' : 'pointer', opacity: seatLoading ? 0.7 : 1 }}
              >
                {seatLoading ? 'Traitement…' : 'Confirmer et inviter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
