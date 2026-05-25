'use client'

import { useEffect } from 'react'

export default function SessionRefresh() {
  useEffect(() => {
    // La DB est déjà à jour — un simple reload suffit pour relire depuis établissements
    window.location.href = '/dashboard'
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(38,33,92,0.9)', zIndex: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 32 }}>🎉</div>
      <div style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>Paiement confirmé</div>
      <div style={{ fontSize: 13, color: '#AFA9EC' }}>Activation de votre compte Pro…</div>
    </div>
  )
}
