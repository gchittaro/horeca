'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  IconBuildingStore, IconMail, IconTrash, IconPlus, IconUsers, IconStar,
  IconShoppingCart, IconMeat, IconEgg, IconCoffee, IconWheat, IconDroplet, IconBolt,
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
  vol_viandes:  1200,
  vol_laitiers:  480,
  vol_cafe:      320,
  vol_farine:    210,
  vol_huiles:    150,
  vol_energie:   900,
}

type Org = { id: string; nom: string; plan: string; created_at: string }
type Member = { id: string; user_id: string | null; role: string; invited_email: string | null; joined_at: string }

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

export default function OrganisationPage() {
  // Organisation
  const [org, setOrg] = useState<Org | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [orgName, setOrgName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [orgError, setOrgError] = useState('')
  const [orgSuccess, setOrgSuccess] = useState('')

  // Établissement
  const [nomEtablissement, setNomEtablissement] = useState('')
  const [siret, setSiret] = useState('')
  const [adresse, setAdresse] = useState('')
  const [ville, setVille] = useState('')
  const [codePostal, setCodePostal] = useState('')
  const [type, setType] = useState('Restaurant traditionnel')
  const [couverts, setCouverts] = useState('')
  const [chambres, setChambres] = useState('')
  const [region, setRegion] = useState('Grand Est')
  const [fournisseurs, setFournisseurs] = useState('')
  const [volumes, setVolumes] = useState<Volumes>(defaultVolumes)
  const [etabSaving, setEtabSaving] = useState(false)
  const [etabSaved, setEtabSaved] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    setUserEmail(user.email ?? '')
    setUserId(user.id)

    const [{ data: orgData }, { data: profil }] = await Promise.all([
      supabase.from('organisations').select('*').eq('owner_id', user.id).single(),
      supabase.from('etablissements').select('*').eq('user_id', user.id).single(),
    ])

    if (orgData) {
      setOrg(orgData)
      const { data: membersData } = await supabase
        .from('organisation_members')
        .select('*')
        .eq('org_id', orgData.id)
        .order('joined_at')
      setMembers(membersData ?? [])
    }

    if (profil) {
      setNomEtablissement(profil.nom_etablissement || '')
      setSiret(profil.siret || '')
      setAdresse(profil.adresse || '')
      setVille(profil.ville || '')
      setCodePostal(profil.code_postal || '')
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
      .from('organisations')
      .insert({ nom: orgName.trim(), owner_id: user.id, plan: 'pro' })
      .select()
      .single()

    if (err) {
      setOrgError(err.message)
      setCreating(false)
      return
    }

    await supabase.from('organisation_members').insert({
      org_id: data.id,
      user_id: user.id,
      role: 'owner',
      invited_email: user.email,
    })
    setCreating(false)
    setOrgName('')
    await loadData()
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim() || !org) return
    setInviting(true)
    setOrgError('')
    const supabase = createClient()

    const alreadyInvited = members.some(m => m.invited_email?.toLowerCase() === inviteEmail.trim().toLowerCase())
    if (alreadyInvited) {
      setOrgError('Cet email a déjà été invité.')
      setInviting(false)
      return
    }

    const { error: err } = await supabase
      .from('organisation_members')
      .insert({
        org_id: org.id,
        user_id: null,
        role: 'member',
        invited_email: inviteEmail.trim().toLowerCase(),
      })

    if (err) {
      setOrgError('Une erreur est survenue. Réessayez.')
    } else {
      setOrgSuccess(`Invitation enregistrée pour ${inviteEmail}`)
      setInviteEmail('')
      await loadData()
      setTimeout(() => setOrgSuccess(''), 4000)
    }
    setInviting(false)
  }

  async function handleRemove(memberId: string, memberRole: string) {
    if (memberRole === 'owner') return
    const supabase = createClient()
    await supabase.from('organisation_members').delete().eq('id', memberId)
    setMembers(prev => prev.filter(m => m.id !== memberId))
  }

  const volFields: { key: keyof Volumes; label: string; Icon: React.ElementType }[] = [
    { key: 'vol_viandes',  label: 'Viandes',                   Icon: IconMeat },
    { key: 'vol_laitiers', label: 'Produits laitiers & œufs',  Icon: IconEgg },
    { key: 'vol_cafe',     label: 'Café & boissons chaudes',   Icon: IconCoffee },
    { key: 'vol_farine',   label: 'Farine & pâtisserie',       Icon: IconWheat },
    { key: 'vol_huiles',   label: 'Huiles & matières grasses', Icon: IconDroplet },
    { key: 'vol_energie',  label: 'Énergie (élec + gaz)',      Icon: IconBolt },
  ]

  if (loading) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center', color: '#AFA9EC', fontSize: 13 }}>
        Chargement…
      </div>
    )
  }

  return (
    <div style={{ padding: '18px 24px', maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#26215C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconBuildingStore size={20} color="#AFA9EC" />
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 500, color: '#26215C' }}>Mon entreprise</div>
          <div style={{ fontSize: 12, color: '#888780' }}>Établissement, volumes d&apos;achats et impact marché</div>
        </div>
      </div>

      {/* Informations établissement */}
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
              <input type="text" value={fournisseurs} onChange={e => setFournisseurs(e.target.value)} placeholder="Transgourmet, Metro, Sysco France, grossiste local…" style={inputStyle} />
            </Field>
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
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#AFA9EC', fontWeight: 500 }}>
          Impact estimé ce mois
        </div>
        <div style={{ fontSize: 13, color: '#D3D1C7', lineHeight: 1.7 }}>
          {totalImpact > 0 && <>Basé sur vos volumes, les variations représentent un <strong style={{ color: '#F09595' }}>surcoût estimé de +{totalImpact} € ce mois</strong>.</>}
          {totalImpact < 0 && <>Basé sur vos volumes, les variations représentent une <span style={{ color: '#97C459' }}>économie estimée de {Math.abs(totalImpact)} € ce mois</span>.</>}
          {totalImpact === 0 && <>Basé sur vos volumes, les variations ont un impact neutre ce mois.</>}
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

      {/* Enregistrer établissement */}
      <button
        onClick={handleSaveEtablissement}
        disabled={etabSaving}
        style={{ background: etabSaved ? '#1D9E75' : '#26215C', color: '#fff', fontSize: 14, fontWeight: 500, padding: 13, borderRadius: 10, border: 'none', cursor: etabSaving ? 'not-allowed' : 'pointer', textAlign: 'center', transition: 'background 0.2s' }}
      >
        {etabSaving ? 'Enregistrement…' : etabSaved ? '✓ Établissement enregistré' : 'Enregistrer mon établissement'}
      </button>

      {/* Séparateur */}
      <div style={{ borderTop: '0.5px solid #CECBF6', margin: '4px 0' }} />

      {/* Titre section équipe */}
      <div style={{ fontSize: 14, fontWeight: 500, color: '#26215C', display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconUsers size={16} color="#534AB7" /> Gestion de l&apos;équipe
      </div>

      {/* Création org */}
      {!org ? (
        <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#26215C', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconBuildingStore size={16} color="#534AB7" /> Créer votre organisation
          </div>
          <div style={{ fontSize: 13, color: '#5F5E5A', marginBottom: 18, lineHeight: 1.6 }}>
            Créez votre organisation pour inviter des collaborateurs et centraliser la veille pour votre groupe.
          </div>
          <form onSubmit={handleCreateOrg} style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
              placeholder="Nom de votre groupe ou entreprise"
              required
              style={{ flex: 1, fontSize: 13, padding: '10px 12px', borderRadius: 8, border: '0.5px solid #CECBF6', background: '#F8F8FC', color: '#26215C', outline: 'none' }}
            />
            <button
              type="submit"
              disabled={creating || !orgName.trim()}
              style={{ fontSize: 13, fontWeight: 500, background: '#26215C', color: '#fff', padding: '10px 20px', borderRadius: 8, border: 'none', cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1, whiteSpace: 'nowrap' }}
            >
              {creating ? 'Création…' : 'Créer'}
            </button>
          </form>
          {orgError && <div style={{ fontSize: 12, color: '#A32D2D', marginTop: 10 }}>{orgError}</div>}
        </div>
      ) : (
        <>
          {/* Infos org */}
          <div style={{ background: '#26215C', borderRadius: 13, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#fff', marginBottom: 4 }}>{org.nom}</div>
              <div style={{ fontSize: 11, color: '#AFA9EC', display: 'flex', gap: 12 }}>
                <span>Plan : Pro</span>
                <span>·</span>
                <span>{members.length} membre{members.length > 1 ? 's' : ''}</span>
                <span>·</span>
                <span>Créée le {new Date(org.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#1F1A4A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconStar size={18} color="#FAC775" />
            </div>
          </div>

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
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', background: '#F8F8FC', border: '0.5px solid #CECBF6', borderRadius: 9, gap: 12 }}>
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
                        <button
                          onClick={() => handleRemove(m.id, m.role)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: '#C06060' }}
                          title="Retirer ce membre"
                        >
                          <IconTrash size={14} />
                        </button>
                      )}
                    </div>
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
              L&apos;invitation sera enregistrée. Le collaborateur devra créer un compte avec cette adresse email pour rejoindre l&apos;organisation.
            </div>
            <form onSubmit={handleInvite} style={{ display: 'flex', gap: 10 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <IconMail size={14} color="#888780" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="collaborateur@etablissement.fr"
                  required
                  style={{ fontSize: 13, padding: '10px 12px 10px 32px', borderRadius: 8, border: '0.5px solid #CECBF6', background: '#F8F8FC', color: '#26215C', outline: 'none', width: '100%' }}
                />
              </div>
              <button
                type="submit"
                disabled={inviting || !inviteEmail.trim()}
                style={{ fontSize: 13, fontWeight: 500, background: '#534AB7', color: '#fff', padding: '10px 18px', borderRadius: 8, border: 'none', cursor: inviting ? 'not-allowed' : 'pointer', opacity: inviting ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
              >
                <IconPlus size={14} />
                {inviting ? 'Envoi…' : 'Inviter'}
              </button>
            </form>
            {orgError && <div style={{ fontSize: 12, color: '#A32D2D', background: '#FCEBEB', padding: '8px 12px', borderRadius: 8, marginTop: 10 }}>{orgError}</div>}
            {orgSuccess && <div style={{ fontSize: 12, color: '#1D6952', background: '#E1F5EE', padding: '8px 12px', borderRadius: 8, marginTop: 10 }}>{orgSuccess}</div>}
          </div>

          {/* Supprimer l'org */}
          <div style={{ fontSize: 11, color: '#888780', textAlign: 'center', lineHeight: 1.6 }}>
            Pour dissoudre l&apos;organisation ou transférer la propriété, contactez le support.
          </div>
        </>
      )}
    </div>
  )
}
