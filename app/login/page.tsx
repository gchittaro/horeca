'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(errorParam === 'auth_callback' ? 'Erreur de connexion. Réessayez.' : '')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : error.message)
      setLoading(false)
    } else {
      router.push(next)
      router.refresh()
    }
  }

  return (
    <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 16, padding: 32, width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 500, color: '#26215C', marginBottom: 6 }}>Connexion</div>
        <div style={{ fontSize: 13, color: '#5F5E5A' }}>Accédez à votre tableau de bord CHR</div>
      </div>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5F5E5A', fontWeight: 500 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="vous@etablissement.fr"
            style={{ fontSize: 13, padding: '9px 11px', borderRadius: 8, border: '0.5px solid #CECBF6', background: '#F8F8FC', color: '#26215C', width: '100%', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5F5E5A', fontWeight: 500 }}>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={{ fontSize: 13, padding: '9px 11px', borderRadius: 8, border: '0.5px solid #CECBF6', background: '#F8F8FC', color: '#26215C', width: '100%', outline: 'none' }}
          />
        </div>

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
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <div style={{ fontSize: 12, color: '#888780', textAlign: 'center' }}>
        Pas encore de compte ?{' '}
        <Link href="/signup" style={{ color: '#534AB7', textDecoration: 'none', fontWeight: 500 }}>S&apos;inscrire</Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F8F8FC', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#26215C', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontSize: 18, fontWeight: 500, color: '#fff', letterSpacing: '-0.02em', textDecoration: 'none' }}>
          HoReCa<span style={{ color: '#AFA9EC' }}>.</span>Watch
        </Link>
      </nav>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Suspense fallback={<div style={{ color: '#AFA9EC' }}>Chargement…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
