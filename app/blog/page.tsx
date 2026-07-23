import Link from 'next/link'
import type { Metadata } from 'next'
import { blogPosts, formatDate } from '@/lib/blog-posts'

export const metadata: Metadata = {
  title: 'Blog HoReCa.Watch — Veille marché CHR, food cost et prix matières premières',
  description: 'Guides pratiques pour les professionnels CHR : veille marché, prix matières premières, food cost, alertes prix et gestion des marges en 2026.',
  alternates: { canonical: 'https://horeca.watch/blog' },
  openGraph: {
    title: 'Blog HoReCa.Watch — Veille marché CHR',
    description: 'Guides pratiques pour les professionnels CHR : veille marché, prix matières premières, food cost et gestion des marges.',
    url: 'https://horeca.watch/blog',
    siteName: 'HoReCa.Watch',
    locale: 'fr_FR',
    type: 'website',
  },
}

const CATEGORIE_COLORS: Record<string, { bg: string; color: string }> = {
  achats:    { bg: '#FAEEDA', color: '#854F0B' },
  finance:   { bg: '#E1F5EE', color: '#0F6E56' },
  strategie: { bg: '#EEEDFE', color: '#534AB7' },
  analyse:   { bg: '#F0EFF9', color: '#26215C' },
}

export default function BlogPage() {
  const sorted = [...blogPosts].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div style={{ minHeight: '100vh', background: '#F8F8FC' }}>
      {/* NAV */}
      <nav style={{ background: '#26215C', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: 18, fontWeight: 500, color: '#fff', letterSpacing: '-0.02em', textDecoration: 'none' }}>
          HoReCa<span style={{ color: '#AFA9EC' }}>.</span>Watch
        </Link>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Link href="/#features" style={{ fontSize: 13, color: '#D3D1C7', textDecoration: 'none' }}>Fonctionnalités</Link>
          <Link href="/blog" style={{ fontSize: 13, color: '#fff', textDecoration: 'none', fontWeight: 500 }}>Blog</Link>
          <Link href="/dashboard" style={{ fontSize: 13, background: '#fff', color: '#26215C', padding: '7px 16px', borderRadius: 8, fontWeight: 500, textDecoration: 'none' }}>
            Dashboard
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: '#26215C', padding: '48px 32px 56px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#AFA9EC', marginBottom: 12 }}>
            Ressources
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 500, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 14px' }}>
            Guides marché CHR
          </h1>
          <p style={{ fontSize: 15, color: '#D3D1C7', lineHeight: 1.7, maxWidth: 520, margin: 0 }}>
            Méthodes, formules et stratégies pour anticiper les prix, piloter vos marges et naviguer la réglementation CHR en France.
          </p>
        </div>
      </div>

      {/* ARTICLES */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 32px 64px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sorted.map(post => {
            const colors = CATEGORIE_COLORS[post.categorie] ?? CATEGORIE_COLORS.analyse
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <article style={{
                  background: '#fff',
                  border: '0.5px solid #CECBF6',
                  borderRadius: 13,
                  padding: '22px 24px',
                  transition: 'border-color 0.15s',
                  cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      background: colors.bg,
                      color: colors.color,
                      padding: '3px 9px',
                      borderRadius: 20,
                    }}>
                      {post.categorieLabel}
                    </span>
                    <span style={{ fontSize: 11, color: '#888780' }}>
                      {formatDate(post.date)} · {post.readingTime} min de lecture
                    </span>
                  </div>
                  <h2 style={{ fontSize: 17, fontWeight: 500, color: '#26215C', letterSpacing: '-0.02em', margin: '0 0 8px', lineHeight: 1.3 }}>
                    {post.title}
                  </h2>
                  <p style={{ fontSize: 13, color: '#5F5E5A', lineHeight: 1.65, margin: '0 0 14px' }}>
                    {post.description}
                  </p>
                  <span style={{ fontSize: 12, color: '#534AB7', fontWeight: 500 }}>
                    Lire l&apos;article →
                  </span>
                </article>
              </Link>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: '#26215C', padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: '#fff', letterSpacing: '-0.02em' }}>
            Mettez ces guides en pratique
          </div>
          <p style={{ fontSize: 13, color: '#D3D1C7', lineHeight: 1.6, margin: 0 }}>
            HoReCa.Watch agrège 18 indicateurs de marché, signaux GDELT et alertes réglementaires — pour que vos lundis commencent par des décisions.
          </p>
          <Link href="/dashboard" style={{ background: '#fff', color: '#26215C', fontSize: 13, fontWeight: 500, padding: '11px 22px', borderRadius: 8, textDecoration: 'none', marginTop: 4 }}>
            Accéder au dashboard
          </Link>
        </div>
      </div>

      <footer style={{ background: '#1F1A4A', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#D3D1C7' }}>
          HoReCa<span style={{ color: '#AFA9EC' }}>.</span>Watch
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link href="/blog" style={{ fontSize: 12, color: '#AFA9EC', textDecoration: 'none' }}>Blog</Link>
          <Link href="/pricing" style={{ fontSize: 12, color: '#AFA9EC', textDecoration: 'none' }}>Tarifs</Link>
        </div>
      </footer>
    </div>
  )
}
