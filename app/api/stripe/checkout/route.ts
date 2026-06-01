import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const priceId = process.env.STRIPE_PRO_PRICE_ID
  if (!priceId) {
    console.error('[stripe/checkout] STRIPE_PRO_PRICE_ID manquant')
    return NextResponse.json({ error: 'Configuration Stripe incomplète' }, { status: 500 })
  }

  const body = await request.json().catch(() => ({}))
  const nbUsers = Math.max(1, Math.min(10, Number(body?.nbUsers) || 1))
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://horeca.watch'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: nbUsers }],
      customer_email: user.email,
      client_reference_id: user.id,
      success_url: `${appUrl}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      metadata: { userId: user.id, nb_users: nbUsers.toString() },
    })
    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error('[stripe/checkout]', e)
    return NextResponse.json({ error: 'Erreur Stripe' }, { status: 500 })
  }
}
