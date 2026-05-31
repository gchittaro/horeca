import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { getUserIsPro } from '@/lib/supabase/isPro'
import { newsletterToken } from '@/app/newsletter/[slug]/page'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const isPro = await getUserIsPro(user.id)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://horeca.watch'

  // Newsletters passées — semaines distinctes avec données (accessible à tous)
  const { data: semaines } = await admin
    .from('indicateurs')
    .select('semaine, annee')
    .order('annee', { ascending: false })
    .order('semaine', { ascending: false })
    .limit(100)

  // Déduplique les (semaine, annee)
  const seen = new Set<string>()
  const newsletters = (semaines || [])
    .filter(r => {
      const k = `${r.annee}-${r.semaine}`
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    .slice(0, 12)
    .map(r => ({
      label: `Semaine ${r.semaine} · ${r.annee}`,
      url: `${appUrl}/newsletter/${r.annee}-S${r.semaine}-${newsletterToken(r.annee, r.semaine)}`,
      semaine: r.semaine,
      annee: r.annee,
    }))

  // Alertes — uniquement pour les Pro
  let alertes: { id: string; titre: string; description: string; severite: string; created_at: string }[] = []
  if (isPro) {
    const { data } = await admin
      .from('alertes')
      .select('id, titre, description, severite, created_at')
      .order('created_at', { ascending: false })
      .limit(20)
    alertes = data || []
  }

  return NextResponse.json({ isPro, alertes, newsletters })
}
