import { NextResponse } from 'next/server'
import { sendLoopsTransactional, createLoopsContact, LOOPS_TX } from '@/lib/loops'

export async function POST(request: Request) {
  const { email, orgName } = await request.json()
  if (!email || !orgName) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }
  if (!LOOPS_TX.TEAM_INVITE) {
    return NextResponse.json({ ok: true, skipped: 'no template id' })
  }

  // S'assurer que le contact existe dans Loops avant l'envoi transactionnel
  await createLoopsContact({ email, plan: 'free' }).catch(() => {})

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://horeca.watch'
  const inviteLink = `${appUrl}?signup=1&email=${encodeURIComponent(email)}`

  const result = await sendLoopsTransactional(email, LOOPS_TX.TEAM_INVITE, {
    orgName,
    inviteEmail: email,
    inviteLink,
  })

  console.log('[loops/invite] result:', JSON.stringify(result))

  if (!result?.success) {
    console.error('[loops/invite] failed:', result)
    return NextResponse.json({ error: result?.message ?? result?.error ?? 'Erreur Loops inconnue' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
