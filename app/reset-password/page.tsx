'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères.'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2500)
    }
  }

  const inputStyle: React.CSSProperties = {
    fontSize: 13, padding: '9px 11px', borderRadius: 8,
    border: '0.5px solid #CECBF6', background: '#F8F8FC',
    color: '#26215C', width: '100%', outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F8FC', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#26215C', padding: '12px 32px', display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: 18, fontWeight: 500, color: '#fff', letterSpacing: '-0.02em', textDecoration: 'none' }}>
          HoReCa<span style={{ color: '#AFA9EC' }}>.</span>Watch
        </Link>
      </nav>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {done ? (
          <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 16, padding: 32, maxWidth: 400, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: 22 }}>✓</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#26215C' }}>Mot de passe mis à jour</div>
            <div style={{ fontSize: 13, color: '#5F5E5A' }}>Redirection vers le dashboard…</div>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 16, padding: 32, width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 500, color: '#26215C', marginBottom: 6 }}>Nouveau mot de passe</div>
              <div style={{ fontSize: 13, color: '#5F5E5A' }}>Choisissez un mot de passe sécurisé (8 caractères minimum).</div>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Nouveau mot de passe',    value: password, set: setPassword },
                { label: 'Confirmer le mot de passe', value: confirm,  set: setConfirm  },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5F5E5A', fontWeight: 500 }}>{f.label}</label>
                  <input
                    type="password"
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                    required
                    placeholder="••••••••"
                    style={inputStyle}
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
                {loading ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
