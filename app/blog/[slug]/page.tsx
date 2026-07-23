import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { blogPosts, formatDate, getBlogPost, getAllSlugs } from '@/lib/blog-posts'
import ArticleContent from './ArticleContent'

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return {}
  const url = `https://horeca.watch/blog/${slug}`
  return {
    title: `${post.title} — HoReCa.Watch`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: 'HoReCa.Watch',
      locale: 'fr_FR',
      type: 'article',
      publishedTime: post.date,
    },
    other: {
      'article:published_time': post.date,
      'article:section': post.categorieLabel,
    },
  }
}

const CATEGORIE_COLORS: Record<string, { bg: string; color: string }> = {
  achats:    { bg: '#FAEEDA', color: '#854F0B' },
  finance:   { bg: '#E1F5EE', color: '#0F6E56' },
  strategie: { bg: '#EEEDFE', color: '#534AB7' },
  analyse:   { bg: '#F0EFF9', color: '#26215C' },
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  const colors = CATEGORIE_COLORS[post.categorie] ?? CATEGORIE_COLORS.analyse
  const related = blogPosts.filter(p => p.slug !== post.slug && p.categorie === post.categorie).slice(0, 2)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: 'HoReCa.Watch', url: 'https://horeca.watch' },
    publisher: { '@type': 'Organization', name: 'HoReCa.Watch', url: 'https://horeca.watch' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://horeca.watch/blog/${slug}` },
    inLanguage: 'fr',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F8FC' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* NAV */}
      <nav style={{ background: '#26215C', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: 18, fontWeight: 500, color: '#fff', letterSpacing: '-0.02em', textDecoration: 'none' }}>
          HoReCa<span style={{ color: '#AFA9EC' }}>.</span>Watch
        </Link>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Link href="/blog" style={{ fontSize: 13, color: '#D3D1C7', textDecoration: 'none' }}>← Blog</Link>
          <Link href="/dashboard" style={{ fontSize: 13, background: '#fff', color: '#26215C', padding: '7px 16px', borderRadius: 8, fontWeight: 500, textDecoration: 'none' }}>
            Dashboard
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: '#26215C', padding: '40px 32px 48px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <Link href="/blog" style={{ fontSize: 11, color: '#AFA9EC', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Blog</Link>
            <span style={{ color: '#3C3489', fontSize: 11 }}>/</span>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', background: colors.bg, color: colors.color, padding: '3px 9px', borderRadius: 20 }}>
              {post.categorieLabel}
            </span>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 500, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2, margin: '0 0 16px', maxWidth: 640 }}>
            {post.title}
          </h1>
          <p style={{ fontSize: 14, color: '#D3D1C7', lineHeight: 1.6, margin: '0 0 20px', maxWidth: 560 }}>
            {post.description}
          </p>
          <div style={{ fontSize: 11, color: '#AFA9EC', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span>{formatDate(post.date)}</span>
            <span>{post.readingTime} min de lecture</span>
          </div>
        </div>
      </div>

      {/* ARTICLE (client component for ReactMarkdown) */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 32px' }}>
        <ArticleContent content={post.content} />

        {/* CTA inline */}
        <div style={{ background: '#26215C', borderRadius: 13, padding: '24px', margin: '40px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>Mettez ce guide en pratique</div>
          <p style={{ fontSize: 13, color: '#D3D1C7', margin: 0, lineHeight: 1.6 }}>
            HoReCa.Watch agrège 18 indicateurs de marché, signaux GDELT et alertes réglementaires — brief du lundi, alertes seuils, Expert CHR IA.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
            <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 500, background: '#fff', color: '#26215C', padding: '9px 18px', borderRadius: 8, textDecoration: 'none' }}>
              Voir le dashboard →
            </Link>
            <Link href="/pricing" style={{ fontSize: 13, color: '#AFA9EC', padding: '9px 18px', borderRadius: 8, textDecoration: 'none', border: '0.5px solid #3C3489' }}>
              Plan Pro — 19 €/mois
            </Link>
          </div>
        </div>

        {/* Articles liés */}
        {related.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
              Sur le même sujet
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {related.map(r => (
                <Link key={r.slug} href={`/blog/${r.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#fff', border: '0.5px solid #CECBF6', borderRadius: 10, padding: '14px 18px' }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#26215C', marginBottom: 4 }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: '#888780' }}>{r.readingTime} min · {formatDate(r.date)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer style={{ background: '#26215C', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 24 }}>
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
