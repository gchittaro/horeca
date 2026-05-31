import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { getUserOrgMembership, getUserIsPro } from '@/lib/supabase/isPro'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const db = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: etab, error: etabErr } = await db.from('etablissements').select('plan, user_id').eq('user_id', user.id).single()
  const { data: member, error: memberErr } = await db.from('organisation_members').select('role, sections, org_id, user_id').eq('user_id', user.id).limit(1).single()

  let org = null
  let orgErr = null
  if (member?.org_id) {
    const res = await db.from('organisations').select('id, plan, nom, owner_id').eq('id', member.org_id).single()
    org = res.data
    orgErr = res.error
  }

  const [orgMembership, isPro] = await Promise.all([
    getUserOrgMembership(user.id, user.email ?? '').catch((e: Error) => ({ error: e.message })),
    getUserIsPro(user.id).catch((e: Error) => ({ error: e.message })),
  ])

  return NextResponse.json({
    userId: user.id,
    email: user.email,
    etab: etab ?? null,
    etabErr: etabErr?.message ?? null,
    member: member ?? null,
    memberErr: memberErr?.message ?? null,
    org: org ?? null,
    orgErr: orgErr?.message ?? null,
    serviceRoleKeyPresent: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    orgMembership,
    isPro,
  })
}
