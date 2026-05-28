'use client'

import { useState, useEffect } from 'react'
import { IconX, IconSparkles, IconChevronRight } from '@tabler/icons-react'

function renderBrief(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return (
        <div key={i} style={{ fontSize: 12, fontWeight: 600, color: '#26215C', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: i === 0 ? 0 : 18, marginBottom: 6 }}>
          {line.replace(/\*\*/g, '')}
        </div>
      )
    }
    if (line.trim() === '') return null
    return (
      <p key={i} style={{ fontSize: 13, color: '#5F5E5A', lineHeight: 1.7, margin: '0 0 4px' }}>
        {line}
      </p>
    )
  })
}

export default function WeeklyBriefDrawer({ semaine }: { semaine: number }) {
  const [open, setOpen] = useState(false)
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    if (open && !fetched) {
      setLoading(true)
      fetch('/api/ai/weekly-brief')
        .then(r => r.json())
        .then(d => { setBrief(d.brief || ''); setFetched(true) })
        .catch(() => setBrief('Impossible de générer le brief. Réessayez.'))
        .finally(() => setLoading(false))
    }
  }, [open, fetched])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: '#26215C', color: '#AFA9EC',
          fontSize: 12, fontWeight: 500,
          padding: '8px 14px', borderRadius: 8,
          border: '0.5px solid #3C3489', cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <IconSparkles size={14} color="#7F77DD" />
        Brief semaine {semaine}
        <IconChevronRight size={13} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,12,40,0.45)', zIndex: 300 }}
        />
      )}

      {/* Panneau droit */}
      <div style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        width: 'min(420px, 100vw)',
        background: '#fff',
        boxShadow: '-8px 0 32px rgba(38,33,92,0.12)',
        zIndex: 301,
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s ease',
      }}>
        {/* Header */}
        <div style={{ background: '#26215C', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconSparkles size={16} color="#7F77DD" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>Brief opérationnel</div>
              <div style={{ fontSize: 11, color: '#AFA9EC' }}>Semaine {semaine} · Généré par IA</div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}
          >
            <IconX size={18} color="#AFA9EC" />
          </button>
        </div>

        {/* Contenu */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
              {[100, 80, 90, 70, 85, 60].map((w, i) => (
                <div key={i} style={{ height: 13, borderRadius: 6, background: '#F0EFF9', width: `${w}%`, animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
              <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
            </div>
          ) : brief ? (
            <div>{renderBrief(brief)}</div>
          ) : null}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '0.5px solid #F0EFF9', flexShrink: 0 }}>
          <button
            onClick={() => { setFetched(false); setBrief('') }}
            disabled={loading}
            style={{ fontSize: 11, color: '#888780', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            ↺ Régénérer
          </button>
        </div>
      </div>
    </>
  )
}
