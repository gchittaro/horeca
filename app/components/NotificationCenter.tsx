'use client'

import { useState, useEffect, useRef } from 'react'
import { IconBell, IconX, IconAlertTriangle, IconNews, IconExternalLink, IconLock } from '@tabler/icons-react'

type Alerte = { id: string; titre: string; description: string; severite: string; created_at: string }
type Newsletter = { label: string; url: string; semaine: number; annee: number }
type Data = { isPro: boolean; alertes: Alerte[]; newsletters: Newsletter[] }

function severiteColor(s: string) {
  if (s === 'high')   return { bg: '#FCEBEB', color: '#A32D2D', border: '#F5C6C6' }
  if (s === 'medium') return { bg: '#FEF3E2', color: '#854D0E', border: '#FDDCB4' }
  return                     { bg: '#EEEDFE', color: '#534AB7', border: '#CECBF6' }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Aujourd'hui"
  if (days === 1) return 'Hier'
  if (days < 7)  return `Il y a ${days}j`
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

export default function NotificationCenter() {
  const [open, setOpen]     = useState(false)
  const [tab, setTab]       = useState<'alertes' | 'newsletters'>('alertes')
  const [data, setData]     = useState<Data | null>(null)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || data) return
    setLoading(true)
    fetch('/api/notifications')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [open, data])

  // Fermer au clic extérieur
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  // Badge nombre alertes non lues
  const alertCount = data?.alertes?.length ?? 0
  const hasAlert = alertCount > 0 && data?.isPro

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      {/* Cloche */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0, position: 'relative' }}
        aria-label="Notifications"
      >
        <IconBell size={18} color={open ? '#fff' : '#AFA9EC'} />
        {hasAlert && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: 8, height: 8, borderRadius: '50%',
            background: '#E24B4A', border: '1.5px solid #26215C',
          }} />
        )}
      </button>

      {/* Panneau */}
      {open && (
        <div style={{
          position: 'absolute', top: 32, right: -8, width: 340,
          background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 13,
          boxShadow: '0 8px 32px rgba(38,33,92,0.15)', zIndex: 200, overflow: 'hidden',
        }}>
          {/* En-tête */}
          <div style={{ background: '#26215C', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Notifications</span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}>
              <IconX size={16} color="#AFA9EC" />
            </button>
          </div>

          {/* Onglets */}
          <div style={{ display: 'flex', borderBottom: '0.5px solid #EEEDFE' }}>
            {[
              { key: 'alertes',     label: 'Alertes',     icon: <IconAlertTriangle size={13} /> },
              { key: 'newsletters', label: 'Newsletters',  icon: <IconNews size={13} /> },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as 'alertes' | 'newsletters')}
                style={{
                  flex: 1, padding: '10px 0', fontSize: 12, fontWeight: tab === t.key ? 600 : 400,
                  color: tab === t.key ? '#26215C' : '#888780',
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: tab === t.key ? '2px solid #26215C' : '2px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  transition: 'color 0.15s',
                }}
              >
                {t.icon} {t.label}
                {t.key === 'alertes' && hasAlert && (
                  <span style={{ fontSize: 9, fontWeight: 600, background: '#E24B4A', color: '#fff', padding: '1px 5px', borderRadius: 10 }}>
                    {alertCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Contenu */}
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {loading && (
              <div style={{ padding: 32, textAlign: 'center', fontSize: 12, color: '#888780' }}>Chargement…</div>
            )}

            {!loading && tab === 'alertes' && (
              <>
                {!data?.isPro ? (
                  <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconLock size={16} color="#534AB7" />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#26215C' }}>Alertes réservées au plan Pro</div>
                    <div style={{ fontSize: 12, color: '#888780', lineHeight: 1.5 }}>
                      Recevez des alertes personnalisées dès que les marchés impactent vos coûts.
                    </div>
                    <a href="/pricing" style={{ fontSize: 12, fontWeight: 600, color: '#534AB7', textDecoration: 'none' }}>
                      Passer au plan Pro →
                    </a>
                  </div>
                ) : data?.alertes?.length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center', fontSize: 12, color: '#888780' }}>
                    Aucune alerte cette semaine.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {data.alertes.map(a => {
                      const c = severiteColor(a.severite)
                      return (
                        <div key={a.id} style={{ padding: '12px 16px', borderBottom: '0.5px solid #F5F4FD' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <span style={{ marginTop: 2, width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0, display: 'inline-block' }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#26215C', marginBottom: 3 }}>{a.titre}</div>
                              <div style={{ fontSize: 11, color: '#534AB7', lineHeight: 1.5 }}>{a.description}</div>
                              <div style={{ fontSize: 10, color: '#B0AED6', marginTop: 5 }}>{timeAgo(a.created_at)}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {!loading && tab === 'newsletters' && (
              <>
                {!data?.newsletters?.length ? (
                  <div style={{ padding: 32, textAlign: 'center', fontSize: 12, color: '#888780' }}>
                    Aucune newsletter disponible pour l&apos;instant.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {data.newsletters.map(n => (
                      <a
                        key={`${n.annee}-${n.semaine}`}
                        href={n.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: '12px 16px', borderBottom: '0.5px solid #F5F4FD', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', color: 'inherit' }}
                      >
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: '#26215C' }}>{n.label}</div>
                          <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>Alimentation &amp; Boissons</div>
                        </div>
                        <IconExternalLink size={13} color="#AFA9EC" />
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
