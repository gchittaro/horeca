import { NextResponse } from 'next/server'
import { sendInviteEmail } from '@/lib/resend'

export async function POST(request: Request) {
  const { email, orgName } = await request.json()
  if (!email || !orgName) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://horeca.watch'
  const inviteLink = `${appUrl}?signup=1&email=${encodeURIComponent(email)}`

  try {
    await sendInviteEmail({ to: email, orgName, inviteLink })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[invite] Resend error:', e)
    return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 })
  }
}
