import Link from 'next/link'
import { IconBell, IconUserCircle } from '@tabler/icons-react'

const navItems = [
  { href: '/dashboard',             label: 'Vue globale' },
  { href: '/dashboard/food',        label: 'Food' },
  { href: '/dashboard/boissons',    label: 'Boissons' },
  { href: '/dashboard/energie',     label: 'Énergie' },
  { href: '/dashboard/rh',          label: 'RH' },
  { href: '/dashboard/juridique',   label: 'Juridique' },
  { href: '/dashboard/geopolitique', label: 'Géopolitique' },
  { href: '/profil',                label: 'Mon établissement' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F8F8FC', display: 'flex', flexDirection: 'column' }}>
      {/* TOPBAR */}
      <div style={{ background: '#26215C', padding: '11px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: 16, fontWeight: 500, color: '#fff', letterSpacing: '-0.02em', textDecoration: 'none' }}>
          HoReCa<span style={{ color: '#AFA9EC' }}>.</span>Watch
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 10, background: '#1F1A4A', color: '#1D9E75', padding: '4px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#1D9E75' }} />
            Mise à jour S21 · 2026
          </div>
          <IconBell size={18} color="#AFA9EC" style={{ cursor: 'pointer' }} />
          <IconUserCircle size={18} color="#AFA9EC" style={{ cursor: 'pointer' }} />
          <div style={{ fontSize: 11, background: '#3C3489', color: '#AFA9EC', padding: '3px 10px', borderRadius: 20 }}>Pro</div>
        </div>
      </div>

      {/* SUBNAV */}
      <div style={{ background: '#1F1A4A', padding: '0 24px', display: 'flex', gap: 0, borderBottom: '0.5px solid #3C3489', overflowX: 'auto' }} className="scrollbar-none">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            style={{ fontSize: 12, color: '#AFA9EC', padding: '11px 16px', borderBottom: '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', display: 'block' }}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1 }}>
        {children}
      </div>

      {/* FOOTER BAR */}
      <div style={{ background: '#26215C', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 10, color: '#534AB7' }}>
          Sources : FranceAgriMer · Matif · ICE · RTE · GDELT · JO · Légifrance — Semaine 21, 2026
        </div>
        <button style={{ fontSize: 12, color: '#AFA9EC', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', background: 'none', border: 'none' }}>
          ↓ Exporter PDF
        </button>
      </div>
    </div>
  )
}
