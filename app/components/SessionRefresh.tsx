'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SessionRefresh() {
  useEffect(() => {
    createClient().auth.refreshSession().finally(() => {
      window.location.href = '/dashboard'
    })
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(38,33,92,0.9)', zIndex: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 32 }}>🎉</div>
      <div style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>Paiement confirmé</div>
      <div style={{ fontSize: 13, color: '#AFA9EC' }}>Activation de votre compte Pro…</div>
    </div>
  )
}
