import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: etab } = await supabase
    .from('etablissements')
    .select('stripe_subscription_id, stripe_customer_id, max_users')
    .eq('user_id', user.id)
    .single()

  if (!etab?.stripe_subscription_id && !etab?.stripe_customer_id) {
    return NextResponse.json({ error: 'Aucun abonnement Stripe trouvé' }, { status: 404 })
  }

  let quantity = 1

  try {
    if (etab.stripe_subscription_id) {
      const sub = await stripe.subscriptions.retrieve(etab.stripe_subscription_id)
      quantity = sub.items.data[0]?.quantity || 1
    } else if (etab.stripe_customer_id) {
      // Fallback : chercher l'abonnement actif via le customer
      const subs = await stripe.subscriptions.list({ customer: etab.stripe_customer_id, status: 'active', limit: 1 })
      if (subs.data[0]) {
        const sub = subs.data[0]
        quantity = sub.items.data[0]?.quantity || 1
        // Enregistrer l'ID pour la prochaine fois
        await supabase.from('etablissements')
          .update({ stripe_subscription_id: sub.id })
          .eq('user_id', user.id)
      }
    }
  } catch (e) {
    console.error('[sync-seats]', e)
    return NextResponse.json({ error: 'Erreur Stripe' }, { status: 500 })
  }

  await supabase.from('etablissements')
    .update({ max_users: quantity, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)

  return NextResponse.json({ max_users: quantity })
}
