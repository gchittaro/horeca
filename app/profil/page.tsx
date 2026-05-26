'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  IconBell, IconUser, IconArrowLeft, IconLogout, IconTrash, IconCreditCard,
} from '@tabler/icons-react'
import { createClient } from '@/lib/supabase/client'

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

export default function ProfilPage() {
  const router = useRouter()

  const [userEmail, setUserEmail] = useState('')
  const [nomGerant, setNomGerant] = useState('')
  const [telephone, setTelephone] = useState('')
  const [role, setRole] = useState('')
  const [alerts, setAlerts] = useState({ surcout: true, geopolitique: true, reglementation: true, pdf: false })
  const [plan, setPlan] = useState('free')

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [isOrgOwner, setIsOrgOwner] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoadingProfile(false); return }
      setUserEmail(user.email ?? '')

      const { data: profil } = await supabase
        .from('etablissements')
        .select('nom_gerant, telephone, role, plan, alert_surcout, alert_geopolitique, alert_reglementation, alert_rapport_pdf')
        .eq('user_id', user.id)
        .single()

      if (profil) {
        setNomGerant(profil.nom_gerant || user.user_metadata?.full_name || '')
        setTelephone(profil.telephone || '')
        setRole(profil.role || '')
        setPlan(profil.plan || user.user_metadata?.plan || 'free')
        setAlerts({
          surcout:        profil.alert_surcout        ?? true,
          geopolitique:   profil.alert_geopolitique   ?? true,
          reglementation: profil.alert_reglementation ?? true,
          pdf:            profil.alert_rapport_pdf    ?? false,
        })
      } else {
        setPlan(user.user_metadata?.plan || 'free')
      }

      const { data: orgData } = await supabase
        .from('organisations')
        .select('id')
        .eq('owner_id', user.id)
        .single()
      setIsOrgOwner(!!orgData)

      setLoadingProfile(false)
    }
    loadProfile()
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase.from('etablissements').upsert({
        user_id: user.id,
        nom_gerant: nomGerant || null,
        telephone: telephone || null,
        role: role || null,
        alert_surcout: alerts.surcout,
        alert_geopolitique: alerts.geopolitique,
        alert_reglementation: alerts.reglementation,
        alert_rapport_pdf: alerts.pdf,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

      if (error) {
        console.error('[profil/save]', error)
        setSaveError(error.message)
        setSaving(false)
        return
      }

      fetch('/api/loops/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, firstName: nomGerant || undefined }),
      }).catch(() => {})
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handlePortal() {
    setPortalLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const { url, error } = await res.json()
    if (url) window.location.href = url
    else { alert(error || 'Erreur'); setPortalLoading(false) }
  }

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setDeleteError(data.error ?? 'Une erreur est survenue.')
        setDeleting(false)
        return
      }
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/?deleted=1')
    } catch {
      setDeleteError('Une erreur réseau est survenue. Réessayez.')
      setDeleting(false)
    }
  }

  if (loadingProfile) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8F8FC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 13, color: '#AFA9EC' }}>Chargement…</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F8FC' }}>
      {/* TOPBAR */}
      <div style={{ background: '#26215C', padding: '11px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: 16, fontWeight: 500, color: '#fff', letterSpacing: '-0.02em', textDecoration: 'none' }}>
          HoReCa<span style={{ color: '#AFA9EC' }}>.</span>Watch
        </Link>
        <Link href="/dashboard" style={{ fontSize: 13, color: '#D3D1C7', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <IconArrowLeft size={14} />
          Dashboard
        </Link>
      </div>

      <div style={{ padding: 24, maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>

        <div style={{ paddingTop: 4 }}>
          <div style={{ fontSize: 22, fontWeight: 500, color: '#26215C', marginBottom: 6 }}>Mon profil</div>
          <div style={{ fontSize: 13, color: '#5F5E5A', lineHeight: 1.6 }}>
            Informations personnelles et préférences de notifications.
          </div>
        </div>

        {/* Profil personnel */}
        <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#26215C', display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconUser size={17} color="#534AB7" /> Profil personnel
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Nom & prénom">
              <input type="text" value={nomGerant} onChange={e => setNomGerant(e.target.value)} placeholder="Marie Dupont" style={inputStyle} />
            </Field>
            <Field label="Téléphone">
              <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+33 6 12 34 56 78" style={inputStyle} />
            </Field>
            <Field label="Email">
              <input type="email" value={userEmail} readOnly style={{ ...inputStyle, background: '#F0EFF9', color: '#888780', cursor: 'default' }} />
            </Field>
          </div>
          <Field label="Mon rôle">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { key: 'directeur', label: '🏨 Directeur' },
                { key: 'chef',      label: '👨‍🍳 Chef de cuisine' },
                { key: 'acheteur',  label: '🛒 Acheteur' },
                { key: 'daf',       label: '💼 DAF / Comptable' },
                { key: 'rh',        label: '👥 RH' },
              ].map(r => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  style={{
                    fontSize: 12,
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: '0.5px solid',
                    borderColor: role === r.key ? '#534AB7' : '#CECBF6',
                    background: role === r.key ? '#EEEDFE' : '#F8F8FC',
                    color: role === r.key ? '#26215C' : '#888780',
                    cursor: 'pointer',
                    fontWeight: role === r.key ? 500 : 400,
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Alertes */}
        <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#26215C', display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconBell size={17} color="#534AB7" /> Alertes personnalisées
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {[
              { key: 'surcout',        name: 'Surcoût mensuel estimé supérieur à 200 €',         sub: 'Email dès que l\'impact cumulé dépasse votre seuil' },
              { key: 'geopolitique',   name: 'Signal géopolitique sur un produit que j\'achète',  sub: 'Notification anticipée 4–6 semaines avant la hausse probable' },
              { key: 'reglementation', name: 'Nouvelle réglementation CHR applicable',            sub: 'Résumé + délai de mise en conformité dès publication au JO' },
              { key: 'pdf',            name: 'Rapport mensuel personnalisé en PDF',               sub: 'Récapitulatif complet avec impact calculé sur vos achats' },
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

        <button
          onClick={handleSave}
          disabled={saving}
          style={{ background: saved ? '#1D9E75' : '#26215C', color: '#fff', fontSize: 14, fontWeight: 500, padding: 13, borderRadius: 10, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', textAlign: 'center', transition: 'background 0.2s' }}
        >
          {saving ? 'Enregistrement…' : saved ? '✓ Profil enregistré' : 'Enregistrer mon profil'}
        </button>
        {saveError && (
          <div style={{ fontSize: 12, color: '#A32D2D', background: '#FCEBEB', padding: '9px 12px', borderRadius: 8 }}>
            Erreur : {saveError}
          </div>
        )}

        {(plan === 'pro' || plan === 'team') && (
          <button
            onClick={handlePortal}
            disabled={portalLoading}
            style={{ background: 'transparent', color: '#534AB7', fontSize: 13, fontWeight: 500, padding: 12, borderRadius: 10, border: '1px solid #CECBF6', cursor: portalLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: portalLoading ? 0.6 : 1 }}
          >
            <IconCreditCard size={15} />
            {portalLoading ? 'Redirection…' : 'Gérer mon abonnement'}
          </button>
        )}

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{ background: 'transparent', color: '#534AB7', fontSize: 13, fontWeight: 500, padding: 12, borderRadius: 10, border: '1px solid #CECBF6', cursor: loggingOut ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: loggingOut ? 0.6 : 1 }}
        >
          <IconLogout size={15} />
          {loggingOut ? 'Déconnexion…' : 'Se déconnecter'}
        </button>

        <button
          onClick={() => setShowDeleteModal(true)}
          style={{ background: 'transparent', color: '#A32D2D', fontSize: 13, padding: 12, borderRadius: 10, border: '1px solid #F5CECE', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
        >
          <IconTrash size={15} />
          Supprimer mon compte
        </button>

        <div style={{ fontSize: 11, color: '#888780', textAlign: 'center', lineHeight: 1.5, paddingBottom: 8 }}>
          Vos données sont privées et ne sont jamais partagées avec des tiers.
        </div>
      </div>

      {/* Modale suppression */}
      {showDeleteModal && (
        <div
          onClick={() => !deleting && setShowDeleteModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,12,40,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 420, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FCEBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconTrash size={20} color="#A32D2D" />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 500, color: '#26215C', marginBottom: 8 }}>Supprimer mon compte</div>
              <div style={{ fontSize: 13, color: '#5F5E5A', lineHeight: 1.7 }}>
                Êtes-vous sûr de vouloir supprimer votre compte ?{' '}
                <strong style={{ color: '#A32D2D' }}>Cette action est irréversible.</strong>{' '}
                Toutes vos données (profil, volumes, alertes) seront définitivement effacées.
              </div>
            </div>
            {isOrgOwner && (
              <div style={{ background: '#FAEEDA', border: '0.5px solid #F5C985', borderRadius: 9, padding: '11px 14px', fontSize: 12, color: '#633806', lineHeight: 1.6 }}>
                <strong>Vous êtes propriétaire d&apos;une organisation.</strong> En supprimant votre compte, tous les accès de vos collaborateurs seront révoqués et votre abonnement s&apos;arrêtera immédiatement.
              </div>
            )}
            {deleteError && (
              <div style={{ fontSize: 12, color: '#A32D2D', background: '#FCEBEB', padding: '9px 12px', borderRadius: 8 }}>
                {deleteError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                style={{ flex: 1, fontSize: 13, fontWeight: 500, padding: 11, borderRadius: 9, background: '#F8F8FC', color: '#26215C', border: '0.5px solid #CECBF6', cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{ flex: 1, fontSize: 13, fontWeight: 500, padding: 11, borderRadius: 9, background: '#A32D2D', color: '#fff', border: 'none', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1 }}
              >
                {deleting ? 'Suppression…' : 'Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
