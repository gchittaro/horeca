import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserOrgMembership } from '@/lib/supabase/isPro'
import { IconBell, IconUserCircle, IconLock, IconBuildingStore } from '@tabler/icons-react'
import { formatUpdateDate } from '@/lib/utils'
import OnboardingTip from '@/app/components/OnboardingTip'
import ChatAgent from '@/app/components/ChatAgent'

const navItems = [
  { href: '/dashboard',              label: 'Vue globale',  proOnly: false },
  { href: '/dashboard/food',         label: 'Alimentation', proOnly: true  },
  { href: '/dashboard/boissons',     label: 'Boissons',     proOnly: true  },
  { href: '/dashboard/energie',      label: 'Énergie',      proOnly: true  },
  { href: '/dashboard/rh',           label: 'RH',           proOnly: true  },
  { href: '/dashboard/juridique',    label: 'Juridique',    proOnly: true  },
  { href: '/dashboard/geopolitique', label: 'Géopolitique', proOnly: true  },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: planRow } = user
    ? await supabase.from('etablissements').select('plan, vol_cafe, vol_viandes, nom_gerant').eq('user_id', user.id).single()
    : { data: null }

  // Auto-lier + vérifier appartenance org pro (requêtes séparées, pas de join)
  const orgMembership = user?.email ? await getUserOrgMembership(user.id, user.email) : null
  const isOrgMemberPro = orgMembership !== null

  const plan = (planRow?.plan ?? user?.user_metadata?.plan ?? 'free') as string
  const isPro = plan === 'pro' || plan === 'team' || isOrgMemberPro
  const needsOrgSetup = isPro && !planRow?.vol_cafe && !planRow?.vol_viandes
  const needsProfilSetup = !planRow?.nom_gerant && !user?.user_metadata?.full_name

  return (
    <div style={{ minHeight: '100vh', background: '#F8F8FC', display: 'flex', flexDirection: 'column' }}>
      {/* TOPBAR */}
      <div className="topbar-inner" style={{ background: '#26215C', padding: '11px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: 16, fontWeight: 500, color: '#fff', letterSpacing: '-0.02em', textDecoration: 'none', flexShrink: 0 }}>
          HoReCa<span style={{ color: '#AFA9EC' }}>.</span>Watch
        </Link>
        <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="hide-mobile" style={{ fontSize: 10, background: '#1F1A4A', color: '#1D9E75', padding: '4px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#1D9E75', flexShrink: 0 }} />
            {formatUpdateDate()}
          </div>
          <IconBell size={18} color="#AFA9EC" style={{ cursor: 'pointer', flexShrink: 0 }} />
          {isPro && orgMembership?.role === 'member' && (
            <div style={{ fontSize: 11, color: '#AFA9EC', flexShrink: 0 }}>
              <span style={{ color: '#534AB7' }}>Organisation</span> · {orgMembership.nom}
            </div>
          )}
          {isPro && orgMembership?.role !== 'member' && (
            needsOrgSetup
              ? <OnboardingTip
                  storageKey="horeca_tip_org"
                  href="/dashboard/organisation"
                  icon={<IconBuildingStore size={18} color="#AFA9EC" style={{ cursor: 'pointer' }} />}
                  iconActive={<IconBuildingStore size={18} color="#ffffff" style={{ cursor: 'pointer' }} />}
                  title="Votre organisation"
                  message="Renseignez vos volumes d'achats et invitez votre équipe pour des alertes calculées précisément."
                  linkLabel="Configurer mon organisation"
                  linkIcon={<IconBuildingStore size={13} />}
                  arrowRight={40}
                />
              : <Link href="/dashboard/organisation" style={{ lineHeight: 0, flexShrink: 0 }} title="Mon entreprise">
                  <IconBuildingStore size={18} color="#AFA9EC" style={{ cursor: 'pointer' }} />
                </Link>
          )}
          {needsProfilSetup
            ? <OnboardingTip
                storageKey="horeca_tip_profil"
                href="/profil"
                icon={<IconUserCircle size={18} color="#AFA9EC" style={{ cursor: 'pointer' }} />}
                iconActive={<IconUserCircle size={18} color="#ffffff" style={{ cursor: 'pointer' }} />}
                title="Votre profil"
                message="Complétez votre nom et configurez vos alertes personnalisées."
                linkLabel="Compléter mon profil"
                linkIcon={<IconUserCircle size={13} />}
                arrowRight={8}
              />
            : <Link href="/profil" style={{ lineHeight: 0, flexShrink: 0 }} title="Mon profil">
                <IconUserCircle size={18} color="#AFA9EC" style={{ cursor: 'pointer' }} />
              </Link>
          }
          <div style={{
            fontSize: 11,
            background: isPro ? '#3C3489' : '#F0EFF9',
            color: isPro ? '#AFA9EC' : '#534AB7',
            padding: '3px 10px',
            borderRadius: 20,
            fontWeight: 500,
            flexShrink: 0,
          }}>
            {isPro ? 'Pro' : 'Free'}
          </div>
        </div>
      </div>

      {/* SUBNAV — données uniquement */}
      <div className="subnav-inner scrollbar-none" style={{ background: '#1F1A4A', padding: '0 24px', display: 'flex', gap: 0, borderBottom: '0.5px solid #3C3489', overflowX: 'auto' }}>
        {navItems.map(item => {
          const sectionKey = item.href.replace('/dashboard/', '')
          const isMember = orgMembership?.role === 'member'
          // Pour les membres : masquer les sections non autorisées
          if (isMember && item.proOnly) {
            const allowed = orgMembership?.sections ?? null
            if (allowed && !allowed.includes(sectionKey)) return null
          }
          const locked = item.proOnly && !isPro
          return (
            <Link
              key={item.href}
              href={locked ? '/dashboard?upgrade=1' : item.href}
              className="subnav-link"
              style={{
                fontSize: 12,
                color: locked ? '#534AB7' : '#AFA9EC',
                padding: '11px 16px',
                borderBottom: '2px solid transparent',
                whiteSpace: 'nowrap',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                flexShrink: 0,
              }}
            >
              {locked && <IconLock size={10} />}
              {item.label}
            </Link>
          )
        })}
      </div>

      <div style={{ flex: 1 }}>
        {children}
      </div>

      {isPro && <ChatAgent />}

      {/* FOOTER */}
      <div style={{ background: '#26215C', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 10, color: '#534AB7' }}>
          Sources : FranceAgriMer · Matif · ICE · RTE · GDELT · Légifrance — Mis à jour le {formatUpdateDate()}
        </div>
      </div>
    </div>
  )
}
