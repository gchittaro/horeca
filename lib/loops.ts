const API = 'https://app.loops.so/api/v1'

/**
 * IDs des emails transactionnels Loops.
 * Créer chaque template dans Loops → Transactional, puis renseigner l'ID dans les env vars Vercel.
 *
 * LOOPS_TX_TEAM_INVITE      → variables : orgName, inviteEmail
 * LOOPS_TX_PRO_CONFIRM      → variables : firstName, dashboardUrl
 * LOOPS_TX_ALERT_COST       → variables : impactEstime, seuilEuros, semaine, annee, dashboardUrl
 * LOOPS_TX_ALERT_GEO        → variables : titreSignal, produitsLies, horizon, dashboardUrl
 * LOOPS_TX_WELCOME_FREE     → variables : firstName
 * LOOPS_TX_SUBSCRIPTION_END → variables : firstName
 */
export const LOOPS_TX = {
  TEAM_INVITE:      process.env.LOOPS_TX_TEAM_INVITE      ?? '',
  PRO_CONFIRM:      process.env.LOOPS_TX_PRO_CONFIRM      ?? '',
  ALERT_COST:       process.env.LOOPS_TX_ALERT_COST       ?? '',
  ALERT_GEO:        process.env.LOOPS_TX_ALERT_GEO        ?? '',
  WELCOME_FREE:     process.env.LOOPS_TX_WELCOME_FREE     ?? '',
  SUBSCRIPTION_END: process.env.LOOPS_TX_SUBSCRIPTION_END ?? '',
}

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
