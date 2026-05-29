'use client'

import { useState } from 'react'
import { IconCheck, IconLock } from '@tabler/icons-react'

function calculerPrixMensuel(nbUsers: number): number {
  const BASE = 19
  const DISCOUNT_PAR_USER = 1
  const MIN_PAR_USER = 11
  if (nbUsers <= 1) return BASE
  const prixParUser = Math.max(BASE - (nbUsers - 1) * DISCOUNT_PAR_USER, MIN_PAR_USER)
  return Math.round(prixParUser * nbUsers)
}

const planFeatFree = [
  { text: 'Newsletter hebdo marché CHR', locked: false },
  { text: '3 indicateurs Food (café, bœuf, farine)', locked: false },
  { text: 'Dashboard complet', locked: true },
  { text: 'Signaux géopolitiques', locked: true },
  { text: 'Alertes personnalisées', locked: true },
]

const planFeatPro = [
  'Dashboard complet — 18 indicateurs',
  'Signaux géopolitiques GDELT',
  'Profil établissement + impact calculé',
  'Expert CHR IA — 10 questions/jour',
  'Alertes email personnalisées',
  'Export CSV / PDF',
  'Newsletter hebdo CHR',
]

export default function PricingSection({ loggedIn, isPro }: { loggedIn: boolean; isPro: boolean }) {
  const [nbUsers, setNbUsers] = useState(1)
  const [loading, setLoading] = useState(false)
  const prix = calculerPrixMensuel(nbUsers)
  const remise = nbUsers > 1 ? Math.round((1 - prix / (nbUsers * 19)) * 100) : 0

  async function handleProCTA() {
    if (!loggedIn) {
      window.dispatchEvent(new CustomEvent('open-signup'))
      return
    }
    if (isPro) {
      window.location.href = '/dashboard'
      return
    }
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nbUsers }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoading(false)
  }

  return (
    <section id="pricing" style={{ padding: '48px 32px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto 24px' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#534AB7', marginBottom: 8, fontWeight: 500 }}>Tarifs</div>
        <div style={{ fontSize: 24, fontWeight: 500, color: '#26215C', letterSpacing: '-0.02em' }}>Simple, sans engagement</div>
      </div>

      <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(220px, 340px))', gap: 14, maxWidth: 720, margin: '0 auto', justifyContent: 'center' }}>
        {/* Gratuit */}
        <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#26215C' }}>Gratuit</div>
          <div style={{ fontSize: 32, fontWeight: 500, color: '#26215C' }}>
            0 €<span style={{ fontSize: 14, color: '#888780', fontWeight: 400 }}> /mois</span>
          </div>
          <div style={{ fontSize: 12, color: '#5F5E5A', lineHeight: 1.5, paddingTop: 10, borderTop: '0.5px solid #E8E7F4' }}>
            Pour découvrir HoReCa.Watch et rester informé des grandes tendances.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            {planFeatFree.map(f => (
              <div key={f.text} style={{ fontSize: 12, color: f.locked ? '#B4B2A9' : '#26215C', display: 'flex', alignItems: 'flex-start', gap: 7, lineHeight: 1.5 }}>
                {f.locked
                  ? <IconLock size={13} color="#D3D1C7" style={{ flexShrink: 0, marginTop: 1 }} />
                  : <IconCheck size={13} color="#26215C" style={{ flexShrink: 0, marginTop: 1 }} />}
                {f.text}
              </div>
            ))}
          </div>
          {loggedIn ? (
            <a href="/dashboard" style={{ fontSize: 13, fontWeight: 500, textAlign: 'center', padding: 11, borderRadius: 9, background: 'transparent', color: '#26215C', border: '1px solid #26215C', textDecoration: 'none', display: 'block' }}>
              Accéder au dashboard
            </a>
          ) : (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-signup'))}
              style={{ fontSize: 13, fontWeight: 500, padding: 11, borderRadius: 9, background: 'transparent', color: '#26215C', border: '1px solid #26215C', cursor: 'pointer' }}
            >
              Commencer gratuitement
            </button>
          )}
        </div>

        {/* Pro */}
        <div style={{ background: '#26215C', border: '2px solid #26215C', borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 10, background: '#3C3489', color: '#AFA9EC', padding: '3px 10px', borderRadius: 20, display: 'inline-block', fontWeight: 500, marginBottom: 8 }}>
              Le plus populaire
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>Pro</div>
          </div>

          {/* Slider */}
          <div style={{ background: '#1F1A4A', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 12, color: '#AFA9EC' }}>
              {nbUsers} utilisateur{nbUsers > 1 ? 's' : ''}
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={nbUsers}
              onChange={e => setNbUsers(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#7F77DD' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: '#534AB7' }}>1</span>
              <span style={{ fontSize: 10, color: '#534AB7' }}>5</span>
              <span style={{ fontSize: 10, color: '#534AB7' }}>10+</span>
            </div>
          </div>

          {/* Prix */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <div style={{ fontSize: 32, fontWeight: 500, color: '#fff' }}>
                {prix} €<span style={{ fontSize: 14, color: '#AFA9EC', fontWeight: 400 }}> /mois</span>
              </div>
              {remise > 0 && (
                <div style={{ fontSize: 11, fontWeight: 600, color: '#1D9E75', background: '#0F2E25', padding: '2px 8px', borderRadius: 20 }}>
                  −{remise}%
                </div>
              )}
            </div>
            {nbUsers > 1 && (
              <div style={{ fontSize: 11, color: '#AFA9EC', marginTop: 3 }}>
                soit {(prix / nbUsers).toFixed(2)} €/utilisateur/mois
              </div>
            )}
          </div>

          <div style={{ fontSize: 12, color: '#AFA9EC', lineHeight: 1.5, paddingTop: 10, borderTop: '0.5px solid #3C3489' }}>
            Pour les professionnels qui veulent anticiper et protéger leurs marges.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            {planFeatPro.map(f => (
              <div key={f} style={{ fontSize: 12, color: '#D3D1C7', display: 'flex', alignItems: 'flex-start', gap: 7, lineHeight: 1.5 }}>
                <IconCheck size={13} color="#7F77DD" style={{ flexShrink: 0, marginTop: 1 }} />
                {f}
              </div>
            ))}
          </div>

          <button
            onClick={handleProCTA}
            disabled={loading}
            style={{ fontSize: 13, fontWeight: 500, padding: 11, borderRadius: 9, background: '#fff', color: '#26215C', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Redirection…' : isPro ? 'Accéder au dashboard' : `Démarrer avec ${nbUsers} utilisateur${nbUsers > 1 ? 's' : ''} →`}
          </button>
          <div style={{ fontSize: 11, color: '#534AB7', textAlign: 'center' }}>
            Sans engagement · Résiliable à tout moment
          </div>
        </div>
      </div>
    </section>
  )
}
