import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PricingSection from '@/app/components/PricingSection'
import SignupPortal from '@/app/components/SignupPortal'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const plan = user?.user_metadata?.plan as string | undefined
  const isPro = plan === 'pro' || plan === 'team'
  const loggedIn = !!user

  return (
    <div style={{ minHeight: '100vh', background: '#F8F8FC', display: 'flex', flexDirection: 'column' }}>
      {/* NAV */}
      <nav style={{ background: '#26215C', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: 18, fontWeight: 500, color: '#fff', letterSpacing: '-0.02em', textDecoration: 'none' }}>
          HoReCa<span style={{ color: '#AFA9EC' }}>.</span>Watch
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {user ? (
            <Link href="/dashboard" style={{ fontSize: 13, background: '#fff', color: '#26215C', padding: '7px 16px', borderRadius: 8, fontWeight: 500, textDecoration: 'none' }}>
              Dashboard
            </Link>
          ) : (
            <Link href="/login" style={{ fontSize: 13, color: '#D3D1C7', padding: '7px 16px', borderRadius: 8, border: '1px solid #3C3489', textDecoration: 'none', fontWeight: 500 }}>
              Se connecter
            </Link>
          )}
        </div>
      </nav>

      {/* HEADER */}
      <div style={{ background: '#26215C', padding: '40px 32px 48px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#AFA9EC', marginBottom: 12, fontWeight: 500 }}>Tarifs</div>
        <h1 style={{ fontSize: 36, fontWeight: 500, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
          Simple, sans engagement
        </h1>
        <p style={{ fontSize: 14, color: '#D3D1C7', marginTop: 12, lineHeight: 1.6 }}>
          Résiliable à tout moment. Aucune carte requise pour le plan gratuit.
        </p>
      </div>

      {/* PRICING */}
      <div style={{ flex: 1 }}>
        <PricingSection loggedIn={loggedIn} isPro={isPro} />
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#26215C', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#D3D1C7', letterSpacing: '-0.02em' }}>
          HoReCa<span style={{ color: '#AFA9EC' }}>.</span>Watch
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Mentions légales', 'CGU', 'Contact'].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: '#AFA9EC', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </footer>

      <SignupPortal />
    </div>
  )
}
