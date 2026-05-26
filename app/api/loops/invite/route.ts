import { NextResponse } from 'next/server'
import { sendLoopsTransactional, LOOPS_TX } from '@/lib/loops'

export async function POST(request: Request) {
  const { email, orgName } = await request.json()
  if (!email || !orgName) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }
  if (!LOOPS_TX.TEAM_INVITE) {
    return NextResponse.json({ ok: true, skipped: 'no template id' })
  }
  await sendLoopsTransactional(email, LOOPS_TX.TEAM_INVITE, { orgName, inviteEmail: email }).catch(() => {})
  return NextResponse.json({ ok: true })
}
