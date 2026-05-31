'use client'

import { useState, useEffect, useRef } from 'react'
import { IconBell, IconX, IconAlertTriangle, IconNews, IconExternalLink, IconLock, IconCheck } from '@tabler/icons-react'

type Alerte = { id: string; titre: string; description: string; severite: string; created_at: string }
type Newsletter = { label: string; url: string; semaine: number; annee: number }
type Data = { isPro: boolean; alertes: Alerte[]; newsletters: Newsletter[] }

const LS_KEY = 'horeca_read_alerts'

function loadReadIds(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')) } catch { return new Set() }
}
function saveReadIds(ids: Set<string>) {
  try { localStorage.setItem(LS_KEY, JSON.stringify([...ids])) } catch {}
}

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
  const [open, setOpen]       = useState(false)
  const [tab, setTab]         = useState<'alertes' | 'newsletters'>('alertes')
  const [data, setData]       = useState<Data | null>(null)
  const [loading, setLoading] = useState(false)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setReadIds(loadReadIds()) }, [])

  useEffect(() => {
    if (!open || data) return
    setLoading(true)
    fetch('/api/notifications')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [open, data])

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  function markRead(id: string) {
    setReadIds(prev => {
      const next = new Set(prev).add(id)
      saveReadIds(next)
      return next
    })
  }

  function markAllRead() {
    const all = new Set(data?.alertes?.map(a => a.id) ?? [])
    setReadIds(prev => {
      const next = new Set([...prev, ...all])
      saveReadIds(next)
      return next
    })
  }

  const unreadAlertes = (data?.alertes ?? []).filter(a => !readIds.has(a.id))
  const hasAlert = unreadAlertes.length > 0 && data?.isPro

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
            <button
              onClick={() => setTab('alertes')}
              style={{
                flex: 1, padding: '10px 0', fontSize: 12, fontWeight: tab === 'alertes' ? 600 : 400,
                color: tab === 'alertes' ? '#26215C' : '#888780',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: tab === 'alertes' ? '2px solid #26215C' : '2px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                transition: 'color 0.15s',
              }}
            >
              <IconAlertTriangle size={13} /> Alertes
              {data && !data.isPro && <IconLock size={10} color="#B0AED6" />}
              {hasAlert && (
                <span style={{ fontSize: 9, fontWeight: 600, background: '#E24B4A', color: '#fff', padding: '1px 5px', borderRadius: 10 }}>
                  {unreadAlertes.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('newsletters')}
              style={{
                flex: 1, padding: '10px 0', fontSize: 12, fontWeight: tab === 'newsletters' ? 600 : 400,
                color: tab === 'newsletters' ? '#26215C' : '#888780',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: tab === 'newsletters' ? '2px solid #26215C' : '2px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                transition: 'color 0.15s',
              }}
            >
              <IconNews size={13} /> Newsletters
            </button>
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
                  <>
                    {/* Barre "tout marquer comme lu" */}
                    {unreadAlertes.length > 0 && (
                      <div style={{ padding: '8px 16px', borderBottom: '0.5px solid #EEEDFE', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={markAllRead}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#534AB7', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                        >
                          <IconCheck size={11} /> Tout marquer comme lu
                        </button>
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {data.alertes.map(a => {
                        const c = severiteColor(a.severite)
                        const isRead = readIds.has(a.id)
                        return (
                          <div key={a.id} style={{ padding: '12px 16px', borderBottom: '0.5px solid #F5F4FD', opacity: isRead ? 0.45 : 1, transition: 'opacity 0.2s' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                              <span style={{ marginTop: 2, width: 8, height: 8, borderRadius: '50%', background: isRead ? '#B0AED6' : c.color, flexShrink: 0, display: 'inline-block' }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#26215C', marginBottom: 3 }}>{a.titre}</div>
                                <div style={{ fontSize: 11, color: '#534AB7', lineHeight: 1.5 }}>{a.description}</div>
                                <div style={{ fontSize: 10, color: '#B0AED6', marginTop: 5 }}>{timeAgo(a.created_at)}</div>
                              </div>
                              {!isRead && (
                                <button
                                  onClick={() => markRead(a.id)}
                                  title="Marquer comme lu"
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, lineHeight: 0, flexShrink: 0, marginTop: 1 }}
                                >
                                  <IconCheck size={13} color="#B0AED6" />
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
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
