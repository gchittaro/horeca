'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { IconX, IconCheck } from '@tabler/icons-react'

export default function SignupPortal() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Ouvrir automatiquement si ?signup=1 dans l'URL (ex : lien depuis email d'invitation)
    if (new URLSearchParams(window.location.search).get('signup') === '1') {
      setOpen(true)
    }
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent
      setEmail(ce.detail?.email || '')
      setStep(1)
      setError('')
      setOpen(true)
    }
    window.addEventListener('open-signup', handler)
    return () => window.removeEventListener('open-signup', handler)
  }, [])

  function close() {
    setOpen(false)
    setStep(1)
    setError('')
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères.'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || location.origin
    const fullName = `${prenom.trim()} ${nom.trim()}`.trim()
    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { plan: 'free', full_name: fullName || null },
        emailRedirectTo: `${appUrl}/api/auth/callback`,
      },
    })
    if (signupError) { setError(signupError.message); setLoading(false); return }
    fetch('/api/loops/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, firstName: prenom.trim() || fullName || undefined, plan: 'free' }),
      keepalive: true,
    }).catch(() => {})
    setLoading(false)
    setStep(2)
  }

  if (!open) return null

  return (
    <div
      onClick={close}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,12,40,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 420, width: '100%', position: 'relative' }}
      >
        <button
          onClick={close}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}
        >
          <IconX size={20} color="#888780" />
        </button>

        {step === 1 && (
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#26215C', letterSpacing: '-0.02em', marginBottom: 4 }}>
                HoReCa<span style={{ color: '#AFA9EC' }}>.</span>Watch
              </div>
              <div style={{ fontSize: 20, fontWeight: 500, color: '#26215C', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Créer votre compte gratuit
              </div>
              <div style={{ fontSize: 13, color: '#5F5E5A', lineHeight: 1.6, marginTop: 6 }}>
                Newsletter chaque lundi matin + accès au dashboard.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Prénom', value: prenom, set: setPrenom, placeholder: 'Marie' },
                { label: 'Nom', value: nom, set: setNom, placeholder: 'Dupont' },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5F5E5A', fontWeight: 500 }}>{f.label}</label>
                  <input
                    type="text"
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                    required
                    placeholder={f.placeholder}
                    style={{ fontSize: 13, padding: '9px 11px', borderRadius: 8, border: '0.5px solid #CECBF6', background: '#F8F8FC', color: '#26215C', outline: 'none' }}
                  />
                </div>
              ))}
            </div>

            {[
              { label: 'Email', type: 'email', value: email, set: setEmail, placeholder: 'vous@etablissement.fr' },
              { label: 'Mot de passe', type: 'password', value: password, set: setPassword, placeholder: '8 caractères minimum' },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5F5E5A', fontWeight: 500 }}>{f.label}</label>
                <input
                  type={f.type}
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  required
                  placeholder={f.placeholder}
                  style={{ fontSize: 13, padding: '9px 11px', borderRadius: 8, border: '0.5px solid #CECBF6', background: '#F8F8FC', color: '#26215C', outline: 'none' }}
                />
              </div>
            ))}

            {error && (
              <div style={{ fontSize: 12, color: '#A32D2D', background: '#FCEBEB', padding: '9px 12px', borderRadius: 8 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ background: '#26215C', color: '#fff', fontSize: 14, fontWeight: 500, padding: 12, borderRadius: 9, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Création du compte…' : 'Créer mon compte'}
            </button>

            <div style={{ fontSize: 11, color: '#888780', textAlign: 'center', lineHeight: 1.5 }}>
              En créant un compte, vous acceptez nos <a href="#" style={{ color: '#534AB7' }}>CGU</a>. Sans engagement.
            </div>
          </form>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#E1F5EE', borderRadius: 10, padding: '12px 14px' }}>
              <IconCheck size={20} color="#0F6E56" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: 13, color: '#04342C', lineHeight: 1.5, fontWeight: 500 }}>
                Compte créé ! Vous recevrez la veille chaque lundi matin.
              </div>
            </div>

            <div style={{ background: '#F8F8FC', border: '0.5px solid #CECBF6', borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#534AB7', fontWeight: 500 }}>Plan Pro</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#26215C' }}>Passez à la vitesse supérieure</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[
                  'Dashboard complet — 18 indicateurs',
                  'Signaux géopolitiques GDELT',
                  'Profil établissement + impact calculé',
                  'Expert CHR IA — 10 questions/jour',
                ].map(feat => (
                  <div key={feat} style={{ fontSize: 12, color: '#26215C', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <IconCheck size={13} color="#7F77DD" style={{ flexShrink: 0 }} />
                    {feat}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, color: '#5F5E5A' }}>
                À partir de <strong style={{ color: '#26215C', fontSize: 16 }}>19 €</strong>/mois
              </div>
              <button
                onClick={() => { window.location.href = '/pricing' }}
                style={{ background: '#26215C', color: '#fff', fontSize: 13, fontWeight: 500, padding: 11, borderRadius: 9, border: 'none', cursor: 'pointer' }}
              >
                Découvrir le plan Pro →
              </button>
            </div>

            <button
              onClick={() => { window.location.href = '/dashboard' }}
              style={{ background: 'none', border: 'none', fontSize: 12, color: '#888780', cursor: 'pointer', textAlign: 'center', padding: 4 }}
            >
              Accéder à mon compte gratuit
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
