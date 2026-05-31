import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { newsletterToken } from '@/app/newsletter/[slug]/page'

function getISOWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const now = new Date()
  const semaine = getISOWeek(now)
  const annee = now.getFullYear()
  const token = newsletterToken(annee, semaine)
  const url = `/newsletter/${annee}-S${semaine}-${token}`

  return NextResponse.redirect(new URL(url, process.env.NEXT_PUBLIC_APP_URL || 'https://horeca.watch'))
}
