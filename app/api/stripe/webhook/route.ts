import { NextResponse } from 'next/server'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js')
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { sendLoopsTransactional, updateLoopsContact, LOOPS_TX } from '@/lib/loops'

async function setPlan(
  admin: ReturnType<typeof createClient>,
  userId: string,
  plan: 'pro' | 'free',
  customerId?: string | null,
  subscriptionId?: string | null,
  maxUsers?: number,
) {
  await admin.auth.admin.updateUserById(userId, { user_metadata: { plan } })

  const { data: existingRows } = await admin
    .from('etablissements')
    .select('user_id')
    .eq('user_id', userId)
    .limit(1)
  const existing = existingRows?.[0] ?? null

  if (existing) {
    const patch: Record<string, unknown> = { plan, updated_at: new Date().toISOString() }
    if (customerId) patch.stripe_customer_id = customerId
    if (subscriptionId) patch.stripe_subscription_id = subscriptionId
    if (maxUsers !== undefined) patch.max_users = maxUsers
    await admin.from('etablissements').update(patch).eq('user_id', userId)
  } else if (plan === 'pro') {
    await admin.from('etablissements').insert({
      user_id: userId,
      plan: 'pro',
      stripe_customer_id: customerId ?? null,
      stripe_subscription_id: subscriptionId ?? null,
      max_users: maxUsers ?? 1,
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
      const nbUsers = parseInt(session.metadata?.nb_users || '1', 10)
      if (userId) {
        await setPlan(
          admin, userId, 'pro',
          session.customer as string | null,
          session.subscription as string | null,
          nbUsers,
        )
        // Email de bienvenue Pro
        if (LOOPS_TX.PRO_CONFIRM && session.customer_email) {
          await sendLoopsTransactional(session.customer_email, LOOPS_TX.PRO_CONFIRM, {}).catch(() => {})
        }
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const nbUsers = sub.items.data[0]?.quantity
      // Ne pas écraser si Stripe renvoie une quantité invalide (événement sans rapport)
      if (nbUsers && nbUsers >= 1) {
        const { data } = await admin
          .from('etablissements')
          .select('user_id, max_users')
          .eq('stripe_customer_id', customerId)
          .single()
        if (data && nbUsers !== (data.max_users ?? 0)) {
          await admin.from('etablissements')
            .update({ max_users: nbUsers, updated_at: new Date().toISOString() })
            .eq('user_id', data.user_id)
        }
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer
      if (customer.email) {
        const { data: { users } } = await admin.auth.admin.listUsers({ filters: { email: customer.email } })
        const user = users?.[0]
        if (user) {
          await setPlan(admin, user.id, 'free')
          await updateLoopsContact(customer.email, { plan: 'free' }).catch(() => {})
          if (LOOPS_TX.SUBSCRIPTION_END) {
            await sendLoopsTransactional(customer.email, LOOPS_TX.SUBSCRIPTION_END, {}).catch(() => {})
          }
        }
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      console.log('[stripe/webhook] Payment failed for customer:', customerId)
      // TODO: Create LOOPS_TX.PAYMENT_FAILED template in Loops and send alert email
    }
  } catch (e) {
    console.error('[stripe/webhook]', e)
  }

  return NextResponse.json({ received: true })
}
