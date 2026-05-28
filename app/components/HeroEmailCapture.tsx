'use client'

import { useState } from 'react'

export default function HeroEmailCapture() {
  const [email, setEmail] = useState('')

  function openPopup() {
    window.dispatchEvent(new CustomEvent('open-signup', { detail: { email } }))
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', maxWidth: 480 }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && openPopup()}
          placeholder="votre@email.com"
          style={{ flex: 1, minWidth: 200, fontSize: 14, padding: '12px 16px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', outline: 'none' }}
        />
        <button
          onClick={openPopup}
          style={{ background: '#7F77DD', color: '#fff', fontSize: 14, fontWeight: 500, padding: '12px 22px', borderRadius: 8, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          Recevoir la veille gratuitement
        </button>
      </div>
      <div style={{ fontSize: 11, color: '#AFA9EC', marginTop: 6 }}>
        Chaque lundi matin · Gratuit · Sans engagement
      </div>
    </div>
  )
}
