import { NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import { sendLoopsTransactional, updateLoopsContact, LOOPS_TX } from '@/lib/loops'

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

      // 1. Mettre à jour le JWT
      await admin.auth.admin.updateUserById(userId, {
        user_metadata: { plan: 'pro' },
      })

      // 2. Vérifier si une ligne existe déjà
      const { data: existing } = await admin
        .from('etablissements')
        .select('user_id')
        .eq('user_id', userId)
        .single()

      if (existing) {
        // Ligne existante → simple update
        await admin
          .from('etablissements')
          .update({
            plan: 'pro',
            stripe_customer_id: session.customer as string | null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
      } else {
        // Nouvelle ligne → insert avec valeurs par défaut
        await admin
          .from('etablissements')
          .insert({
            user_id: userId,
            plan: 'pro',
            stripe_customer_id: session.customer as string | null,
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
    // 3. Email de confirmation Pro via Loops
    if (userId) {
      try {
        const admin2 = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
        const { data: { user: authUser } } = await admin2.auth.admin.getUserById(userId)
        if (authUser?.email) {
          await updateLoopsContact(authUser.email, { plan: 'pro' }).catch(() => {})
          if (LOOPS_TX.PRO_CONFIRM) {
            const { data: profil } = await admin2.from('etablissements').select('nom_gerant').eq('user_id', userId).single()
            await sendLoopsTransactional(authUser.email, LOOPS_TX.PRO_CONFIRM, {
              prenom: profil?.nom_gerant || '',
              dashboardUrl: 'https://horeca.watch/dashboard',
            }).catch(() => {})
          }
        }
      } catch { /* non bloquant */ }
    }
  } catch (e) {
    console.error('[stripe/success]', e)
  }

  return NextResponse.redirect(new URL('/dashboard?upgraded=1', request.url))
}
