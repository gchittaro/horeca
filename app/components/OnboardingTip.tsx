'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { IconX } from '@tabler/icons-react'

interface Props {
  storageKey: string
  icon: React.ReactNode
  iconActive: React.ReactNode
  href: string
  title: string
  message: string
  linkLabel: string
  linkIcon: React.ReactNode
  arrowRight?: number
}

export default function OnboardingTip({ storageKey, icon, iconActive, href, title, message, linkLabel, linkIcon, arrowRight = 8 }: Props) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!localStorage.getItem(storageKey)) setVisible(true)
  }, [storageKey])

  function dismiss() {
    localStorage.setItem(storageKey, '1')
    setVisible(false)
  }

  useEffect(() => {
    if (!visible) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) dismiss()
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [visible])

  return (
    <div ref={ref} style={{ position: 'relative', lineHeight: 0, flexShrink: 0 }}>
      <Link href={href} onClick={dismiss} style={{ lineHeight: 0 }}>
        {visible ? iconActive : icon}
      </Link>

      {visible && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 14px)',
          right: 0,
          width: 240,
          background: '#ffffff',
          border: '0.5px solid #CECBF6',
          borderRadius: 10,
          padding: '14px 14px 14px 16px',
          boxShadow: '0 8px 24px rgba(38,33,92,0.15)',
          zIndex: 200,
        }}>
          <div style={{
            position: 'absolute',
            top: -6,
            right: arrowRight,
            width: 10,
            height: 10,
            background: '#ffffff',
            border: '0.5px solid #CECBF6',
            borderRight: 'none',
            borderBottom: 'none',
            transform: 'rotate(45deg)',
          }} />

          <button
            onClick={dismiss}
            style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}
            aria-label="Fermer"
          >
            <IconX size={13} color="#888780" />
          </button>

          <div style={{ fontSize: 11, fontWeight: 600, color: '#26215C', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </div>
          <div style={{ fontSize: 12, color: '#5F5E5A', lineHeight: 1.6, marginBottom: 10 }}>
            {message}
          </div>
          <Link
            href={href}
            onClick={dismiss}
            style={{ fontSize: 12, fontWeight: 500, color: '#534AB7', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            {linkIcon}
            {linkLabel} →
          </Link>
        </div>
      )}
    </div>
  )
}
