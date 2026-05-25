import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

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

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer
    if (customer.email) {
      const { data: { users } } = await admin.auth.admin.listUsers()
      const user = users.find(u => u.email === customer.email)
      if (user) {
        await admin.auth.admin.updateUserById(user.id, {
          user_metadata: { plan: 'free' },
        })
        await admin.from('etablissements').upsert({
          user_id: user.id,
          plan: 'free',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
      }
    }
  }

  return NextResponse.json({ received: true })
}
