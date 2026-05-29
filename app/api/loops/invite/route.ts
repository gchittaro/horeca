import { NextResponse } from 'next/server'
import { sendLoopsEvent, createLoopsContact } from '@/lib/loops'

export async function POST(request: Request) {
  const { email, orgName } = await request.json()
  if (!email || !orgName) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://horeca.watch'
  const inviteLink = `${appUrl}?signup=1&email=${encodeURIComponent(email)}`

  // Créer le contact s'il n'existe pas encore
  await createLoopsContact({ email, plan: 'free' }).catch(() => {})

  const result = await sendLoopsEvent(email, 'team_invite', {
    orgName,
    inviteLink,
  })

  console.log('[loops/invite] result:', JSON.stringify(result))

  if (!result?.success) {
    console.error('[loops/invite] failed:', result)
    return NextResponse.json({ error: result?.message ?? result?.error ?? 'Erreur Loops inconnue' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
