import { createClient as createAdminClient } from '@supabase/supabase-js'
import { updateLoopsContact } from '@/lib/loops'

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getUserIsPro(userId: string): Promise<boolean> {
  const db = admin()

  const { data: etab } = await db.from('etablissements').select('plan').eq('user_id', userId).single()
  if (etab?.plan === 'pro' || etab?.plan === 'team') return true

  const { data: member } = await db.from('organisation_members').select('org_id').eq('user_id', userId).limit(1).single()
  if (!member?.org_id) return false

  const { data: org } = await db.from('organisations').select('plan').eq('id', member.org_id).single()
  return org?.plan === 'pro' || org?.plan === 'team'
}

// Retourne le user_id de l'établissement à utiliser (owner de l'org si membre, soi-même sinon)
export async function getEtablissementOwnerId(userId: string): Promise<string> {
  const db = admin()
  const { data: member } = await db.from('organisation_members').select('org_id, role').eq('user_id', userId).limit(1).single()
  if (!member?.org_id || member.role === 'owner') return userId
  const { data: org } = await db.from('organisations').select('owner_id').eq('id', member.org_id).single()
  return org?.owner_id ?? userId
}

export async function getUserOrgMembership(userId: string, userEmail: string): Promise<{ role: string; nom: string; sections: string[] | null } | null> {
  const db = admin()

  // Auto-lier les invitations en attente
  const { data: pending } = await db.from('organisation_members').select('id').eq('invited_email', userEmail.toLowerCase()).is('user_id', null)
  if (pending?.length) {
    await db.from('organisation_members').update({ user_id: userId }).eq('invited_email', userEmail.toLowerCase()).is('user_id', null)
    updateLoopsContact(userEmail, { plan: 'pro' }).catch(() => {})
  }

  const { data: member } = await db.from('organisation_members').select('role, sections, org_id').eq('user_id', userId).limit(1).single()
  if (!member?.org_id) return null

  const { data: org } = await db.from('organisations').select('plan, nom').eq('id', member.org_id).single()
  if (!org || (org.plan !== 'pro' && org.plan !== 'team')) return null

  return { role: member.role, nom: org.nom, sections: member.sections ?? null }
}
