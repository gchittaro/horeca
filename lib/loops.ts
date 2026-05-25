const API = 'https://app.loops.so/api/v1'

async function req(path: string, method: string, body?: unknown) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

export type LoopsContactData = {
  email: string
  firstName?: string
  plan?: string
  typeEtablissement?: string
  region?: string
  nomEtablissement?: string
}

/** Crée un contact dans Loops. Silencieux si l'email existe déjà. */
export async function createLoopsContact(data: LoopsContactData) {
  return req('/contacts/create', 'POST', {
    email: data.email,
    firstName: data.firstName ?? '',
    userGroup: data.plan === 'pro' || data.plan === 'team' ? 'Pro' : 'Free',
    plan: data.plan ?? 'free',
    typeEtablissement: data.typeEtablissement ?? '',
    region: data.region ?? '',
    nomEtablissement: data.nomEtablissement ?? '',
    source: 'HoReCa.Watch',
  })
}

/** Met à jour un contact existant dans Loops. */
export async function updateLoopsContact(email: string, data: Partial<LoopsContactData>) {
  const payload: Record<string, unknown> = { email }
  if (data.firstName !== undefined)        payload.firstName = data.firstName
  if (data.plan !== undefined)             payload.userGroup = data.plan === 'pro' || data.plan === 'team' ? 'Pro' : 'Free'
  if (data.plan !== undefined)             payload.plan = data.plan
  if (data.typeEtablissement !== undefined) payload.typeEtablissement = data.typeEtablissement
  if (data.region !== undefined)           payload.region = data.region
  if (data.nomEtablissement !== undefined) payload.nomEtablissement = data.nomEtablissement
  return req('/contacts/update', 'PUT', payload)
}

/** Supprime un contact de Loops. */
export async function deleteLoopsContact(email: string) {
  return req('/contacts/delete', 'POST', { email })
}

/**
 * Envoie un événement à un contact.
 * Côté Loops dashboard : créer un Loop déclenché par cet eventName.
 *
 * Événements utilisés :
 *   - "newsletter_weekly"       → envoyé chaque lundi (cron send-newsletter)
 *   - "alert_cost"              → surcoût estimé > seuil (cron check-alerts)
 *   - "alert_geopolitical"      → signal géopolitique sur produit acheté
 *   - "signup_welcome"          → à la création du compte
 */
export async function sendLoopsEvent(
  email: string,
  eventName: string,
  eventProperties?: Record<string, unknown>
) {
  return req('/events/send', 'POST', {
    email,
    eventName,
    eventProperties: eventProperties ?? {},
  })
}

/**
 * Envoie un email transactionnel via un template Loops.
 * Le template doit être créé dans Loops dashboard — récupérer son ID.
 */
export async function sendLoopsTransactional(
  email: string,
  transactionalId: string,
  dataVariables: Record<string, unknown>
) {
  return req('/transactional', 'POST', { transactionalId, email, dataVariables })
}
