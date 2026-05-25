'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function SignupForm() {
  const searchParams = useSearchParams()
  const isPro = searchParams.get('plan') === 'pro'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères.'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || location.origin
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { plan: isPro ? 'pro_pending' : 'free' },
        emailRedirectTo: `${appUrl}/api/auth/callback`,
      },
    })
    if (error) { setError(error.message); setLoading(false) }
    else {
      // Créer le contact dans Loops (fire-and-forget)
      fetch('/api/loops/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan: isPro ? 'pro_pending' : 'free' }),
      }).catch(() => {})
      setDone(true)
    }
  }

  if (done) {
    return (
      <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 16, padding: 32, maxWidth: 400, textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>✓</div>
        <div style={{ fontSize: 20, fontWeight: 500, color: '#26215C', marginBottom: 8 }}>Vérifiez votre email</div>
        <div style={{ fontSize: 13, color: '#5F5E5A', lineHeight: 1.6 }}>
          Un lien de confirmation a été envoyé à <strong>{email}</strong>.<br />
          Cliquez dessus pour activer votre compte.
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 16, padding: 32, width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {isPro && (
        <div style={{ background: '#EEEDFE', border: '0.5px solid #CECBF6', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#26215C' }}>
          Vous avez choisi le <strong>plan Pro</strong> — activation après inscription.
        </div>
      )}

      <div>
        <div style={{ fontSize: 22, fontWeight: 500, color: '#26215C', marginBottom: 6 }}>Créer un compte</div>
        <div style={{ fontSize: 13, color: '#5F5E5A' }}>30 jours gratuits, sans carte bancaire</div>
      </div>

      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { label: 'Email',                    type: 'email',    value: email,    set: setEmail,    placeholder: 'vous@etablissement.fr' },
          { label: 'Mot de passe',             type: 'password', value: password, set: setPassword, placeholder: '8 caractères minimum' },
          { label: 'Confirmer le mot de passe', type: 'password', value: confirm,  set: setConfirm,  placeholder: '••••••••' },
        ].map(f => (
          <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5F5E5A', fontWeight: 500 }}>{f.label}</label>
            <input
              type={f.type}
              value={f.value}
              onChange={e => f.set(e.target.value)}
              required
              placeholder={f.placeholder}
              style={{ fontSize: 13, padding: '9px 11px', borderRadius: 8, border: '0.5px solid #CECBF6', background: '#F8F8FC', color: '#26215C', width: '100%', outline: 'none' }}
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
          style={{ background: '#26215C', color: '#fff', fontSize: 14, fontWeight: 500, padding: 13, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Création du compte…' : 'Créer mon compte'}
        </button>
      </form>

      <div style={{ fontSize: 12, color: '#888780', textAlign: 'center', lineHeight: 1.5 }}>
        Déjà un compte ?{' '}
        <Link href="/login" style={{ color: '#534AB7', textDecoration: 'none', fontWeight: 500 }}>Se connecter</Link>
      </div>

      <div style={{ fontSize: 11, color: '#888780', textAlign: 'center' }}>
        En créant un compte, vous acceptez nos <a href="#" style={{ color: '#534AB7' }}>CGU</a>.
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F8F8FC', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#26215C', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontSize: 18, fontWeight: 500, color: '#fff', letterSpacing: '-0.02em', textDecoration: 'none' }}>
          HoReCa<span style={{ color: '#AFA9EC' }}>.</span>Watch
        </Link>
      </nav>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Suspense fallback={<div style={{ color: '#AFA9EC' }}>Chargement…</div>}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  )
}
