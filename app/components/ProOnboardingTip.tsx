'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { IconBuildingStore, IconX } from '@tabler/icons-react'

const STORAGE_KEY = 'horeca_pro_tip_dismissed'

export default function ProOnboardingTip() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
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
      <Link href="/dashboard/organisation" onClick={dismiss} style={{ lineHeight: 0 }} title="Mon entreprise">
        <IconBuildingStore size={18} color={visible ? '#ffffff' : '#AFA9EC'} style={{ cursor: 'pointer' }} />
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
          {/* flèche */}
          <div style={{
            position: 'absolute',
            top: -6,
            right: 8,
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
            Commencez ici
          </div>
          <div style={{ fontSize: 12, color: '#5F5E5A', lineHeight: 1.6, marginBottom: 10 }}>
            Renseignez votre établissement, vos volumes d'achats et invitez votre équipe pour des alertes personnalisées.
          </div>
          <Link
            href="/dashboard/organisation"
            onClick={dismiss}
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#534AB7',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <IconBuildingStore size={13} />
            Configurer mon organisation →
          </Link>
        </div>
      )}
    </div>
  )
}
