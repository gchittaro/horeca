import { NextResponse } from 'next/server'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js')
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

async function setPlan(admin: ReturnType<typeof createClient>, userId: string, plan: 'pro' | 'free', customerId?: string | null) {
  await admin.auth.admin.updateUserById(userId, { user_metadata: { plan } })

  const { data: existing } = await admin
    .from('etablissements')
    .select('user_id')
    .eq('user_id', userId)
    .single()

  if (existing) {
    const patch: Record<string, unknown> = { plan, updated_at: new Date().toISOString() }
    if (customerId) patch.stripe_customer_id = customerId
    await admin.from('etablissements').update(patch).eq('user_id', userId)
  } else if (plan === 'pro') {
    await admin.from('etablissements').insert({
      user_id: userId,
      plan: 'pro',
      stripe_customer_id: customerId ?? null,
      type_etablissement: 'Restaurant traditionnel',
      region: 'Île-de-France',
      alert_surcout: true,
      alert_geopolitique: true,
      alert_reglementation: true,
      alert_rapport_pdf: false,
      updated_at: new Date().toISOString(),
    })
  }
}

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature invalide' }, { status: 400 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = (session.metadata?.userId || session.client_reference_id) as string | null
      if (userId) {
        await setPlan(admin, userId, 'pro', session.customer as string | null)
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer
      if (customer.email) {
        const { data: { users } } = await admin.auth.admin.listUsers()
        const user = users.find((u: { email: string }) => u.email === customer.email)
        if (user) {
          await setPlan(admin, user.id, 'free')
        }
      }
    }
  } catch (e) {
    console.error('[stripe/webhook]', e)
  }

  return NextResponse.json({ received: true })
}
