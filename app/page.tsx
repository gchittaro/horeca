import Link from 'next/link'
import {
  IconChartLine, IconWorld, IconBolt, IconScale,
  IconBuildingStore, IconBell,
} from '@tabler/icons-react'
import { createClient } from '@/lib/supabase/server'
import { tickerItems } from '@/lib/mock-data'
import WeeklyBriefDemo from '@/app/components/WeeklyBriefDemo'
import SignupPortal from '@/app/components/SignupPortal'
import NavSignupButton from '@/app/components/NavSignupButton'
import HeroEmailCapture from '@/app/components/HeroEmailCapture'
import PricingSection from '@/app/components/PricingSection'

const features = [
  { Icon: IconChartLine,    title: 'Prix matières premières', desc: '18 indicateurs clés actualisés depuis FranceAgriMer, Matif, ICE.' },
  { Icon: IconWorld,        title: 'Signaux géopolitiques',   desc: 'GDELT analyse 100+ langues pour anticiper les tensions sur les approvisionnements.' },
  { Icon: IconBolt,         title: 'Énergie',                 desc: 'Électricité spot et gaz TTF via ODRÉ et RTE Open Data.' },
  { Icon: IconScale,        title: 'Réglementation',          desc: 'Légifrance, JO, DGCCRF, convention HCR — les textes qui comptent, résumés.' },
  { Icon: IconBuildingStore, title: 'Profil établissement',   desc: 'Renseignez vos volumes — recevez des alertes calculées pour votre situation réelle.' },
  { Icon: IconBell,         title: 'Alertes personnalisées',  desc: 'Seuils sur mesure — notifié avant que les prix impactent vos marges.' },
]

const signals = [
  {
    type: 'geo' as const,
    Icon: IconWorld,
    title: "Sécheresse Côte d'Ivoire — cacao sous tension",
    desc: "GDELT détecte une intensification médiatique +38% sur 7j. Probabilité de hausse élevée dans 4–6 semaines.",
    time: "Signal géopolitique · GDELT · Semaine 21",
  },
  {
    type: 'food' as const,
    Icon: IconChartLine,
    title: "Café arabica : plus haut depuis 18 mois",
    desc: "+11,2% sur le mois, porté par la sécheresse brésilienne et la demande asiatique.",
    time: "Food · ICE NY · Semaine 21",
  },
  {
    type: 'legal' as const,
    Icon: IconScale,
    title: "Affichage prix cartes — décret applicable le 01/09/2026",
    desc: "Mention TTC et TVA distincte obligatoire sur les menus. 15 semaines pour se mettre en conformité. Source : Légifrance.",
    time: "Juridique · Légifrance · Semaine 18",
  },
]

const sigIconStyle: Record<string, { bg: string; color: string }> = {
  geo:   { bg: '#E1F5EE', color: '#0F6E56' },
  food:  { bg: '#FAEEDA', color: '#854F0B' },
  legal: { bg: '#26215C', color: '#AFA9EC' },
}

export default async function HomePage() {
  const doubled = [...tickerItems, ...tickerItems]

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const plan = user?.user_metadata?.plan as string | undefined
  const isPro = plan === 'pro' || plan === 'team'
  const loggedIn = !!user

  return (
    <>
      {/* NAV */}
      <nav className="home-nav" style={{ background: '#26215C', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: 18, fontWeight: 500, color: '#fff', letterSpacing: '-0.02em', textDecoration: 'none', flexShrink: 0 }}>
          HoReCa<span style={{ color: '#AFA9EC' }}>.</span>Watch
        </Link>
        <div className="hide-mobile" style={{ display: 'flex', gap: 24 }}>
          <a href="#features" style={{ fontSize: 13, color: '#D3D1C7', textDecoration: 'none' }}>Fonctionnalités</a>
          <a href="#pricing"  style={{ fontSize: 13, color: '#D3D1C7', textDecoration: 'none' }}>Tarifs</a>
        </div>
        {user ? (
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <Link href="/dashboard" style={{ fontSize: 13, color: '#D3D1C7', padding: '7px 16px', borderRadius: 8, border: '1px solid #3C3489', textDecoration: 'none', fontWeight: 500 }}>
              Dashboard
            </Link>
            <Link href="/profil" style={{ fontSize: 13, background: '#fff', color: '#26215C', padding: '7px 16px', borderRadius: 8, fontWeight: 500, textDecoration: 'none' }}>
              Mon compte
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, flexShrink: 0, alignItems: 'center' }}>
            <Link href="/login" style={{ fontSize: 13, color: '#D3D1C7', padding: '7px 16px', borderRadius: 8, border: '1px solid #3C3489', textDecoration: 'none', fontWeight: 500 }}>
              Se connecter
            </Link>
            <NavSignupButton label="Essai gratuit" />
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="home-hero" style={{ background: '#26215C', padding: '64px 32px 72px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#D3D1C7', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75', flexShrink: 0 }} />
            Veille marché CHR · France · mis à jour chaque jour
          </div>
          <h1 className="home-hero-h1" style={{ fontSize: 42, fontWeight: 500, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Le pouls du<br />marché <span style={{ color: '#AFA9EC' }}>CHR</span><br />en temps réel.
          </h1>
          <p style={{ fontSize: 15, color: '#D3D1C7', lineHeight: 1.7, maxWidth: 500 }}>
            Prix matières premières, signaux géopolitiques, alertes réglementation — tout ce dont vous avez besoin pour anticiper, pas subir.
          </p>

          {user ? (
            <div className="home-hero-buttons" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
              <Link href="/dashboard" style={{ background: '#fff', color: '#26215C', fontSize: 14, fontWeight: 500, padding: '12px 24px', borderRadius: 8, textDecoration: 'none', display: 'inline-block' }}>
                Voir le dashboard
              </Link>
              <Link href="/profil" style={{ background: 'transparent', color: '#fff', fontSize: 14, padding: '12px 24px', borderRadius: 8, border: '1px solid #AFA9EC', textDecoration: 'none', display: 'inline-block' }}>
                Mon compte
              </Link>
            </div>
          ) : (
            <div style={{ marginTop: 6 }}>
              <HeroEmailCapture />
            </div>
          )}

          <div className="home-hero-stats" style={{ display: 'flex', gap: 40, marginTop: 16, paddingTop: 20, borderTop: '0.5px solid #3C3489', flexWrap: 'wrap' }}>
            {[
              { val: '18',      label: 'Indicateurs suivis' },
              { val: '6',       label: 'Catégories de veille' },
              { val: 'GDELT',   label: 'Signal géopolitique' },
              { val: '1/jour',  label: 'Fréquence de mise à jour' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 24, fontWeight: 500, color: '#fff' }}>{s.val}</div>
                <div style={{ fontSize: 11, color: '#D3D1C7', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ background: '#1F1A4A', padding: '10px 0', overflow: 'hidden', borderBottom: '0.5px solid #3C3489' }}>
        <div className="ticker-track">
          {doubled.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', whiteSpace: 'nowrap', borderRight: i === doubled.length - 1 ? 'none' : '1px solid #3C3489' }}>
              <span style={{ fontSize: 11, color: '#D3D1C7' }}>{item.name}</span>
              <span style={{ fontSize: 11, color: item.up === true ? '#F09595' : item.up === false ? '#97C459' : '#AFA9EC' }}>
                {item.up === true ? '↑' : item.up === false ? '↓' : '='} {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="home-section" style={{ padding: '48px 32px', background: '#f0f0f8' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#534AB7', marginBottom: 8, fontWeight: 500 }}>Ce que vous obtenez</div>
          <div style={{ fontSize: 24, fontWeight: 500, color: '#26215C', letterSpacing: '-0.02em', marginBottom: 24 }}>Tout le marché CHR, une seule plateforme</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            {features.map(f => (
              <div key={f.title} style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 12, padding: 20 }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: '#26215C', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <f.Icon size={19} color="#AFA9EC" />
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#26215C', marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: '#5F5E5A', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNALS */}
      <section className="home-section" style={{ background: '#F0EFF9', padding: '48px 32px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', marginBottom: 20 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#534AB7', marginBottom: 8, fontWeight: 500 }}>Signaux de la semaine</div>
          <div style={{ fontSize: 24, fontWeight: 500, color: '#26215C', letterSpacing: '-0.02em' }}>Ce que HoReCa.Watch surveille pour vous</div>
        </div>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {signals.map(s => (
            <div key={s.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: sigIconStyle[s.type].bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.Icon size={15} color={sigIconStyle[s.type].color} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#26215C', marginBottom: 3 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: '#444441', lineHeight: 1.5, marginBottom: 4 }}>{s.desc}</div>
                <div style={{ fontSize: 10, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.time}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WEEKLY BRIEF DEMO */}
      <WeeklyBriefDemo loggedIn={loggedIn} isPro={isPro} />

      {/* PRICING */}
      <PricingSection loggedIn={loggedIn} isPro={isPro} />

      {/* FOOTER */}
      <footer style={{ background: '#26215C', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: '#D3D1C7', letterSpacing: '-0.02em' }}>
          HoReCa<span style={{ color: '#AFA9EC' }}>.</span>Watch
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Mentions légales', 'CGU', 'Contact'].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: '#AFA9EC', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </footer>

      {/* Popup d'inscription */}
      <SignupPortal />
    </>
  )
}
