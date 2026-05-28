'use client'

export default function NavSignupButton({ label = "Essai gratuit" }: { label?: string }) {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('open-signup'))}
      style={{ fontSize: 13, background: '#fff', color: '#26215C', padding: '7px 18px', borderRadius: 8, fontWeight: 500, border: 'none', cursor: 'pointer' }}
    >
      {label}
    </button>
  )
}
