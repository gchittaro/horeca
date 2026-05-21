import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HoReCa.Watch — Le pouls du marché CHR',
  description: 'Veille marché pour les professionnels de l\'hôtellerie-restauration en France.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
