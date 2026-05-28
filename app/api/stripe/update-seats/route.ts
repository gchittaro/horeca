import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { newQuantity } = await request.json()
  if (!newQuantity || newQuantity < 1) return NextResponse.json({ error: 'Quantité invalide' }, { status: 400 })

  const { data: etab } = await supabase
    .from('etablissements')
    .select('stripe_subscription_id, max_users')
    .eq('user_id', user.id)
    .single()

  // Mettre à jour Stripe si un abonnement existe
  if (etab?.stripe_subscription_id) {
    try {
      const subscription = await stripe.subscriptions.retrieve(etab.stripe_subscription_id)
      const itemId = subscription.items.data[0]?.id
      if (itemId) {
        await stripe.subscriptionItems.update(itemId, { quantity: newQuantity })
      }
    } catch (e) {
      console.error('[update-seats] Stripe error:', e)
      return NextResponse.json({ error: 'Erreur Stripe' }, { status: 500 })
    }
  }

  // Toujours mettre à jour la DB
  await supabase
    .from('etablissements')
    .update({ max_users: newQuantity, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)

  return NextResponse.json({ success: true, max_users: newQuantity })
}
