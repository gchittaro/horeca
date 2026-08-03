import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { getISOWeek, formatUpdateDate } from '@/lib/utils'
import { mockIndicateurs } from '@/lib/mock-data'
import NavSignupButton from '@/app/components/NavSignupButton'
import SignupPortal from '@/app/components/SignupPortal'
import SimulatorForm, { type SimIndicateur } from '@/app/components/SimulatorForm'

export const metadata: Metadata = {
  title: 'Simulateur d\'impact achats — HoReCa.Watch',
  description: 'Estimez en 30 secondes l\'impact des variations de prix matières premières et énergie de la semaine sur les achats de votre établissement CHR.',
}

const VOL_TO_NOM: Record<string, string> = {
  vol_cafe: 'Café arabica',
  vol_viandes: 'Bœuf haché 15%',
  vol_laitiers: 'Lait entier',
  vol_farine: 'Farine T55',
  vol_huiles: 'Huile tournesol',
  vol_energie: 'Électricité spot',
}

export default async function SimulatorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const semaine = getISOWeek(now)
  const annee = now.getFullYear()
  const dateMAJ = formatUpdateDate()

  const noms = Object.values(VOL_TO_NOM)
  let indicateursDB: { nom: string; variation_pct: number; valeur: number | null; unite: string | null; source: string }[] | null = null

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data } = await admin
      .from('indicateurs')
      .select('nom, variation_pct, valeur, unite, source')
      .eq('semaine', semaine)
      .eq('annee', annee)
      .in('nom', noms)
    indicateursDB = data
  }

  const source = indicateursDB?.length ? indicateursDB : mockIndicateurs.filter(i => noms.includes(i.nom))
  const byNom = Object.fromEntries(source.map(i => [i.nom, i]))

  const indicateurs: SimIndicateur[] = Object.entries(VOL_TO_NOM).map(([key, nom]) => {
    const ind = byNom[nom]
    return {
      key,
      nom,
      variation_pct: ind?.variation_pct ?? 0,
      valeur: ind?.valeur ?? null,
      unite: ind?.unite ?? null,
      source: ind?.source ?? '—',
    }
  })

  return (
    <>
      {/* NAV */}
      <nav style={{ background: '#26215C', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: 18, fontWeight: 500, color: '#fff', letterSpacing: '-0.02em', textDecoration: 'none', flexShrink: 0 }}>
          HoReCa<span style={{ color: '#AFA9EC' }}>.</span>Watch
        </Link>
        {user ? (
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <Link href="/dashboard" style={{ fontSize: 13, color: '#D3D1C7', padding: '7px 16px', borderRadius: 8, border: '1px solid #3C3489', textDecoration: 'none', fontWeight: 500 }}>
              Dashboard
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
      <section style={{ background: '#26215C', padding: '48px 32px 40px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#D3D1C7', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75', flexShrink: 0 }} />
            Données de la semaine {semaine} · mises à jour le {dateMAJ}
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 500, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Simulateur d&apos;impact achats
          </h1>
          <p style={{ fontSize: 14, color: '#D3D1C7', lineHeight: 1.7, maxWidth: 520 }}>
            Renseignez vos volumes d&apos;achats mensuels et découvrez, en fonction des indicateurs matières premières et énergie suivis par HoReCa.Watch cette semaine, l&apos;impact estimé sur vos coûts.
          </p>
        </div>
      </section>

      {/* SIMULATOR */}
      <section style={{ background: '#F0EFF9', padding: '28px 32px 56px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <SimulatorForm indicateurs={indicateurs} />
          <div style={{ fontSize: 11, color: '#7A7896', lineHeight: 1.6, marginTop: 14, textAlign: 'center' }}>
            Simulation à titre indicatif, basée sur les indicateurs café, viande bovine, lait, farine, huile tournesol et électricité suivis cette semaine.
            Créez un compte pour un calcul personnalisé sur l&apos;ensemble de vos postes d&apos;achats.
          </div>
        </div>
      </section>

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

      <SignupPortal />
    </>
  )
}
