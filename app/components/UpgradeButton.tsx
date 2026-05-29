'use client'

import { useRouter } from 'next/navigation'

export default function UpgradeButton({
  label = 'Passer Pro',
  style,
}: {
  label?: string
  style?: React.CSSProperties
}) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/pricing')}
      style={{ cursor: 'pointer', border: 'none', ...style }}
    >
      {label}
    </button>
  )
}
