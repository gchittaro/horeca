import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HoReCa.Watch — Le pouls du marché CHR',
  description: 'Veille marché pour les professionnels de l\'hôtellerie-restauration en France.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'HoReCa.Watch — Le pouls du marché CHR',
    description: 'Veille marché pour les professionnels de l\'hôtellerie-restauration en France.',
    images: [{ url: '/logo.png', width: 1000, height: 1000 }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    images: ['/logo.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-G435FPK69S" />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-G435FPK69S');` }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
