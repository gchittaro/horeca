'use client'

import { useState, useRef, useEffect } from 'react'
import { IconMessageCircle, IconX, IconSend, IconRipple } from '@tabler/icons-react'

const SUGGESTIONS = [
  'Mon fournisseur me demande +9% sur le beurre, c\'est justifié ?',
  'Est-ce le bon moment pour renégocier mon contrat énergie ?',
  'Quels produits sont sous tension en ce moment ?',
  'Quelles obligations réglementaires dois-je connaître ce mois ?',
]

type Message = { role: 'user' | 'agent'; text: string }

function renderAnswer(text: string) {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} style={{ height: 8 }} />
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} style={{ fontSize: 12, fontWeight: 700, color: '#26215C', margin: '12px 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{line.replace(/\*\*/g, '')}</p>
    }
    return <p key={i} style={{ fontSize: 13, color: '#26215C', lineHeight: 1.65, margin: 0 }}>{line}</p>
  })
}

export default function ChatAgent() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [quota, setQuota] = useState<number | null>(null)
  const [quotaReached, setQuotaReached] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text: string) {
    if (!text.trim() || loading || quotaReached) return
    const userMsg = text.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg }),
    })
    const data = await res.json()
    setLoading(false)

    if (data.quota_reached) {
      setQuotaReached(true)
      setMessages(prev => [...prev, { role: 'agent', text: data.error }])
    } else if (data.answer) {
      setMessages(prev => [...prev, { role: 'agent', text: data.answer }])
      setQuota(data.quota_remaining)
    } else {
      setMessages(prev => [...prev, { role: 'agent', text: 'Une erreur est survenue. Réessayez.' }])
    }
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  const empty = messages.length === 0

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 52, height: 52, borderRadius: '50%',
          background: '#26215C', border: '1px solid #3C3489',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 4px 20px rgba(38,33,92,0.35)',
          zIndex: 200,
        }}
        title="Expert CHR"
      >
        <IconMessageCircle size={22} color="#AFA9EC" />
      </button>

      {/* Overlay */}
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,12,40,0.35)', zIndex: 300 }} />
      )}

      {/* Panneau */}
      <div style={{
        position: 'fixed', bottom: 0, right: 0,
        width: 'min(420px, 100vw)',
        height: 'min(620px, 100dvh)',
        background: '#fff',
        boxShadow: '-8px 0 32px rgba(38,33,92,0.12)',
        zIndex: 301,
        display: 'flex', flexDirection: 'column',
        borderRadius: '12px 0 0 0',
        transform: open ? 'translateY(0)' : 'translateY(110%)',
        transition: 'transform 0.25s ease',
      }}>

        {/* Header */}
        <div style={{ background: '#26215C', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px 0 0 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <IconRipple size={16} color="#7F77DD" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>Expert CHR</div>
              {quota !== null && (
                <div style={{ fontSize: 10, color: '#AFA9EC' }}>{quota} question{quota > 1 ? 's' : ''} restante{quota > 1 ? 's' : ''} aujourd'hui</div>
              )}
            </div>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}>
            <IconX size={18} color="#AFA9EC" />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
          {empty && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 13, color: '#888780', lineHeight: 1.6, margin: 0 }}>
                Posez vos questions sur les achats, les coûts, la réglementation ou le marché CHR de la semaine.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 4 }}>
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{ fontSize: 12, color: '#534AB7', background: '#F0EFF9', border: '0.5px solid #CECBF6', borderRadius: 8, padding: '9px 12px', textAlign: 'left', cursor: 'pointer', lineHeight: 1.4 }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
              <div style={{
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                background: m.role === 'user' ? '#26215C' : '#F0EFF9',
                fontSize: 13,
                color: m.role === 'user' ? '#fff' : '#26215C',
                lineHeight: 1.65,
              }}>
                {m.role === 'agent' ? renderAnswer(m.text) : m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 5, padding: '8px 14px', background: '#F0EFF9', borderRadius: '12px 12px 12px 2px', width: 'fit-content', marginBottom: 12 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#7F77DD', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
              <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.7)} 40%{transform:scale(1)} }`}</style>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '10px 14px 14px', borderTop: '0.5px solid #F0EFF9', flexShrink: 0 }}>
          {quotaReached ? (
            <div style={{ fontSize: 12, color: '#A32D2D', background: '#FCEBEB', padding: '10px 12px', borderRadius: 8, textAlign: 'center' }}>
              Quota journalier atteint — revenez demain
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="Posez votre question…"
                rows={1}
                style={{ flex: 1, fontSize: 13, padding: '9px 11px', borderRadius: 8, border: '0.5px solid #CECBF6', background: '#F8F8FC', color: '#26215C', resize: 'none', outline: 'none', lineHeight: 1.5, fontFamily: 'inherit' }}
              />
              <button
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                style={{ background: '#26215C', border: 'none', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', opacity: loading || !input.trim() ? 0.5 : 1, flexShrink: 0 }}
              >
                <IconSend size={16} color="#fff" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
