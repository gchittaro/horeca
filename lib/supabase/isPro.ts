import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * Vérifie si un utilisateur est pro :
 * - soit via son propre plan (etablissements.plan)
 * - soit via son appartenance à une org pro
 */
export async function getUserIsPro(userId: string): Promise<boolean> {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: etab } = await admin
    .from('etablissements')
    .select('plan')
    .eq('user_id', userId)
    .single()

  if (etab?.plan === 'pro' || etab?.plan === 'team') return true

  const { data: membership } = await admin
    .from('organisation_members')
    .select('organisations(plan)')
    .eq('user_id', userId)
    .limit(1)
    .single()

  const orgPlan = (membership?.organisations as { plan?: string } | null)?.plan
  return orgPlan === 'pro' || orgPlan === 'team'
}
