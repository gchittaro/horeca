'use client'

import { useState } from 'react'

export default function ProCTA({
  loggedIn,
  label = 'Démarrer',
  nbUsers = 1,
  style,
}: {
  loggedIn: boolean
  label?: string
  nbUsers?: number
  style?: React.CSSProperties
}) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!loggedIn) {
      window.dispatchEvent(new CustomEvent('open-signup'))
      return
    }
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nbUsers }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoading(false)
  }

  return (
    <button onClick={handleClick} disabled={loading} style={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, border: 'none', ...style }}>
      {loading ? 'Redirection…' : label}
    </button>
  )
}
