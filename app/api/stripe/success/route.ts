import { NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const userId = (session.metadata?.userId || session.client_reference_id) as string | null

    if (userId) {
      const admin = createAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // 1. Mettre à jour user_metadata (pour le JWT futur)
      await admin.auth.admin.updateUserById(userId, {
        user_metadata: { plan: 'pro' },
      })

      // 2. Écrire le plan dans etablissements (source de vérité côté DB)
      await admin.from('etablissements').upsert({
        user_id: userId,
        plan: 'pro',
        stripe_customer_id: session.customer as string | null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
    }
  } catch (e) {
    console.error('[stripe/success]', e)
  }

  return NextResponse.redirect(new URL('/dashboard?upgraded=1', request.url))
}
