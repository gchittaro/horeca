'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProCTA({
  loggedIn,
  label = 'Démarrer',
  style,
}: {
  loggedIn: boolean
  label?: string
  style?: React.CSSProperties
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClick() {
    if (!loggedIn) {
      router.push('/signup?plan=pro')
      return
    }
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
