'use client'

import { useState } from 'react'

export default function UpgradeButton({
  label = 'Passer Pro',
  style,
}: {
  label?: string
  style?: React.CSSProperties
}) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
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
