# Brief technique — HoReCa.Watch
## Pour Claude Code

---

## Contexte du projet

HoReCa.Watch est une plateforme de veille marché pour les professionnels de l'hôtellerie-restauration (CHR) en France.
Elle agrège des données publiques (prix matières premières, signaux géopolitiques, réglementation, RH, énergie)
et les présente sous forme de dashboard personnalisé par établissement.

**Maquettes HTML disponibles :**
- `homepage.html` — page de présentation publique
- `dashboard.html` — dashboard abonné (vue globale)
- `profil-etablissement.html` — formulaire profil + calcul d'impact personnalisé

---

## Stack technique retenue

| Composant | Choix |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Base de données | Supabase (PostgreSQL) |
| Auth | Supabase Auth — email/password + Google OAuth |
| Hébergement | Vercel |
| Emails | Resend (alertes + newsletter hebdo) |
| Paiement | Phase 2 (Stripe) — prévoir user.plan dans Supabase dès le MVP |
| Cron jobs | Vercel Cron (fetch automatique des données) |

---

## Structure des pages

```
/                          → homepage.html (public)
/login                     → page connexion magic link
/dashboard                 → dashboard.html (protégé, plan free + pro)
/dashboard/food            → sous-catégorie Food
/dashboard/boissons        → sous-catégorie Boissons
/dashboard/energie         → sous-catégorie Énergie
/dashboard/rh              → sous-catégorie RH
/dashboard/juridique       → sous-catégorie Juridique
/dashboard/geopolitique    → sous-catégorie Géopolitique
/profil                    → profil-etablissement.html (protégé, plan pro uniquement)
/signup                    → inscription email
/signup?plan=pro           → inscription avec plan pro présélectionné
```

---

## Modèle de données Supabase

### Table `users` (géré par Supabase Auth)
Champs supplémentaires via `user_metadata` :
- `plan` : 'free' | 'pro' | 'team'
- `created_at`

### Table `etablissements`
```sql
id                  uuid primary key
user_id             uuid references auth.users
type_etablissement  text  -- 'restaurant' | 'hotel_restaurant' | 'brasserie' | etc.
couverts_par_jour   integer
nombre_chambres     integer nullable
region              text
fournisseurs        text nullable

-- Volumes d'achats mensuels (en €)
vol_viandes         numeric default 0
vol_laitiers        numeric default 0
vol_cafe            numeric default 0
vol_farine          numeric default 0
vol_huiles          numeric default 0
vol_energie         numeric default 0

-- Préférences alertes
alert_surcout       boolean default true
alert_geopolitique  boolean default true
alert_reglementation boolean default true
alert_rapport_pdf   boolean default false
seuil_alerte_euros  numeric default 200

created_at          timestamptz default now()
updated_at          timestamptz default now()
```

### Table `indicateurs`
```sql
id            uuid primary key
categorie     text  -- 'food' | 'boissons' | 'energie' | 'rh' | 'juridique' | 'geopolitique'
nom           text  -- 'Café arabica'
valeur        numeric
unite         text  -- '€/livre' | '€/tonne' | etc.
variation_pct numeric  -- +11.2 ou -5.2
source        text  -- 'ICE NY' | 'FranceAgriMer' | etc.
fetched_at    timestamptz default now()
semaine       integer  -- numéro de semaine ISO
annee         integer
```

### Table `alertes`
```sql
id            uuid primary key
user_id       uuid references auth.users
type          text  -- 'surcout' | 'geopolitique' | 'reglementation' | 'signal'
titre         text
description   text
severite      text  -- 'high' | 'medium' | 'low'
produit_lie   text nullable
lu            boolean default false
created_at    timestamptz default now()
```

### Table `signaux_geopolitiques`
```sql
id            uuid primary key
titre         text
description   text
zone          text  -- 'Côte d\'Ivoire' | 'Brésil' | 'Mer Rouge'
produits_lies text[]  -- ['cacao', 'café']
impact        text  -- 'hausse' | 'baisse' | 'incertain'
horizon       text  -- '4–6 semaines'
source        text  -- 'GDELT'
fetched_at    timestamptz default now()
```

---

## Sources de données — Fetch automatique

### Cron Vercel — toutes les heures (`/api/cron/fetch-data`)

**1. FranceAgriMer / RNM**
- URL : `https://rnm.franceagrimer.fr/prix` (API ou scraping CSV)
- Données : fruits, légumes, viandes, œufs, lait

**2. data.gouv.fr — FranceAgriMer**
- URL : `https://www.data.gouv.fr/fr/organizations/franceagrimer/`
- Format : CSV téléchargeable, céréales + vins

**3. RTE Open Data — Électricité**
- URL : `https://data.rte-france.com/catalog/-/api/market/Wholesale-Market-Prices-in-France/v1/`
- Auth : token OAuth2 gratuit (inscription RTE)

**4. GDELT — Signaux géopolitiques**
- URL : `https://api.gdeltproject.org/api/v2/doc/doc?query=FOOD+COMMODITY&mode=artlist&format=json`
- Mots-clés à surveiller : cacao côte d'ivoire, café brésil, blé ukraine, huile tournesol, mer rouge shipping
- Analyser la tonalité + fréquence pour détecter les tensions émergentes

**5. Légifrance / JO — Réglementation**
- RSS : `https://www.legifrance.gouv.fr/rss/jorf.xml`
- Filtrer sur : restauration, hôtellerie, HCR, HACCP, allergènes, taxe séjour

**6. L'Hôtellerie Restauration — RH & actualités**
- RSS : `https://www.lhotellerie-restauration.fr/rss.xml`
- Filtrer : emploi, salaires, convention collective, recrutement

### Traitement des données fetchées
Après chaque fetch → appel Claude API pour :
1. Extraire les chiffres clés
2. Calculer la variation vs semaine précédente
3. Détecter les signaux géopolitiques émergents
4. Générer un résumé en français naturel

```javascript
// Exemple d'appel Claude API pour synthèse
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `Tu es un analyste marché CHR. Voici les données brutes fetchées cette semaine :
      
      ${rawData}
      
      Extrais et retourne UNIQUEMENT un JSON valide avec :
      {
        "indicateurs": [{ "nom": "...", "valeur": 0, "variation_pct": 0, "source": "...", "unite": "..." }],
        "signaux": [{ "titre": "...", "description": "...", "zone": "...", "impact": "hausse|baisse|incertain", "horizon": "..." }],
        "alertes": [{ "titre": "...", "description": "...", "severite": "high|medium|low" }]
      }`
    }]
  })
});
```

---

## Calcul d'impact personnalisé

Quand l'utilisateur sauvegarde son profil établissement, recalculer :

```javascript
function calculerImpact(profil, indicateurs) {
  const mapping = {
    'Café arabica':     profil.vol_cafe,
    'Bœuf haché':       profil.vol_viandes,
    'Lait entier':      profil.vol_laitiers,
    'Farine T55':       profil.vol_farine,
    'Huile tournesol':  profil.vol_huiles,
    'Électricité spot': profil.vol_energie,
  };
  
  return indicateurs.map(ind => ({
    nom: ind.nom,
    variation_pct: ind.variation_pct,
    volume_mensuel: mapping[ind.nom] || 0,
    impact_euros: Math.round((mapping[ind.nom] || 0) * ind.variation_pct / 100)
  }));
}
```

---

## Gestion des plans

### Middleware Next.js — protection des routes
```javascript
// middleware.ts
export function middleware(request) {
  const { pathname } = request.nextUrl;
  const protectedRoutes = ['/dashboard', '/profil'];
  const proOnlyRoutes = ['/profil'];
  
  // Vérifier session Supabase
  // Si pas de session → redirect /login
  // Si plan free sur route pro → redirect /dashboard avec banner upgrade
}
```

### Différences free vs pro dans le dashboard
- **Free** : 3 indicateurs Food visibles, reste flou avec overlay "Passer Pro"
- **Pro** : tout visible + onglet "Mon établissement" + alertes personnalisées

---

## Système d'alertes email (Resend)

### Newsletter hebdo (lundi 8h, cron Vercel)
```javascript
// Template : résumé des 5 signaux les plus importants de la semaine
// Envoi à tous les utilisateurs (free + pro)
// Personnalisé pour Pro : ajouter "Impact estimé sur votre établissement : +X€"
```

### Alertes temps réel (déclenchées par le cron de fetch)
```javascript
// Pour chaque utilisateur pro :
// 1. Calculer l'impact sur son profil
// 2. Si impact > seuil_alerte_euros → envoyer email
// 3. Si signal géopolitique sur produit qu'il achète → envoyer email
// 4. Si nouvelle réglementation détectée → envoyer email
```

---

## Design system — Tokens CSS

Intégrer ces variables dans `globals.css` ou `tailwind.config.js` :

```css
:root {
  /* Palette principale */
  --chr-nuit:    #26215C;  /* Fond nav, KPI, hero */
  --chr-profond: #3C3489;  /* Hover états */
  --chr-anchor:  #534AB7;  /* Icônes, labels */
  --chr-primary: #7F77DD;  /* Accent interactif */
  --chr-soft:    #AFA9EC;  /* Texte secondaire sur fond sombre */
  --chr-muted:   #CECBF6;  /* Bordures, séparateurs */
  --chr-tint:    #EEEDFE;  /* Backgrounds légers */
  --chr-surface: #F8F8FC;  /* Page background */

  /* Sémantique */
  --chr-up:      #E24B4A;  /* Hausse de prix */
  --chr-up-bg:   #FCEBEB;
  --chr-down:    #639922;  /* Baisse de prix */
  --chr-down-bg: #EAF3DE;
  --chr-warn:    #BA7517;  /* Alerte modérée */
  --chr-warn-bg: #FAEEDA;
  --chr-geo:     #1D9E75;  /* Signal géopolitique positif */
  --chr-geo-bg:  #E1F5EE;
}
```

**Tailwind config** : étendre `theme.colors` avec ces tokens.

---

## Icônes par catégorie

Utiliser Tabler Icons (`@tabler/icons-react`) :

| Catégorie | Icône |
|---|---|
| Food | `IconSalad` |
| Boissons | `IconGlassFull` |
| Énergie | `IconBolt` |
| RH | `IconUsers` |
| Juridique | `IconScale` |
| Géopolitique | `IconWorld` |
| Alertes | `IconBell` |
| Profil établissement | `IconBuildingStore` |

---

## Variables d'environnement (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

ANTHROPIC_API_KEY=

RESEND_API_KEY=

CRON_SECRET=  # Pour sécuriser les endpoints /api/cron/*

# Sources données (si authentification requise)
RTE_CLIENT_ID=
RTE_CLIENT_SECRET=
GDELT_API_KEY=  # Optionnel — GDELT v2 est partiellement public
```

---

## Ordre de développement recommandé

1. **Setup** : Next.js + Tailwind + Supabase auth magic link
2. **Pages HTML → composants** : Convertir les 3 maquettes en composants React
3. **Auth flow** : /login → magic link → /dashboard
4. **Base de données** : Créer les tables Supabase, seed avec données mock
5. **Dashboard** : Afficher les indicateurs depuis Supabase
6. **Profil établissement** : Formulaire + calcul d'impact en temps réel
7. **Cron + fetch** : Pipeline de données automatique
8. **Alertes email** : Resend + templates
9. **Gating plans** : Free vs Pro, middleware, overlay upgrade
10. **Déploiement** : Vercel + variables d'env de production

---

## Notes importantes

- Le ticker de prix sur la homepage doit être animé (scroll horizontal automatique en CSS)
- Le calcul d'impact sur le profil établissement doit se recalculer en temps réel à chaque modification des volumes (pas besoin de sauvegarder pour voir l'impact)
- Les signaux géopolitiques GDELT ont une latence de ~1h — afficher la date du dernier fetch
- Prévoir dès le départ un `plan_history` dans Supabase pour le futur Stripe
- Les pages /dashboard/[categorie] peuvent partager le même layout avec un paramètre de filtre

---

## Auth — Email/password + Google OAuth (mise à jour)

### Configuration Supabase Auth
Activer dans le dashboard Supabase :
1. **Email/password** — activé par défaut
2. **Google OAuth** — créer un projet Google Cloud Console, activer l'API OAuth2, récupérer `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET`, les renseigner dans Supabase Auth Providers

### Page /login
```tsx
// Deux options visibles :
// 1. Formulaire email + password
// 2. Bouton "Continuer avec Google" (icône Google + texte blanc sur fond #26215C)

// Supabase client
const { error } = await supabase.auth.signInWithPassword({ email, password })
const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
```

### Page /signup
```tsx
// Même layout que /login avec :
// 1. Formulaire email + password + confirmation password
// 2. Bouton Google
// 3. Après inscription → plan 'free' par défaut dans user_metadata
// 4. Si ?plan=pro en query param → afficher banner "Vous avez choisi le plan Pro"
//    (activation manuelle pour l'instant, Stripe en phase 2)

await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { plan: searchParams.get('plan') === 'pro' ? 'pro_pending' : 'free' }
  }
})
```

### Variables d'env supplémentaires
```
# Google OAuth (via Supabase)
# À configurer dans le dashboard Supabase directement — pas besoin de les exposer ici
# Supabase gère le callback OAuth automatiquement
```

## Paiement — Phase 2

Pour l'instant, gérer le plan manuellement :
- Utilisateur s'inscrit → plan `free` par défaut
- Pour passer en Pro : mettre à jour `user_metadata.plan = 'pro'` via le dashboard Supabase
- Prévoir dès maintenant le champ `plan` dans `user_metadata` et une table `subscriptions` vide pour Stripe plus tard

```sql
-- Table subscriptions (vide pour l'instant, prête pour Stripe)
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users unique,
  plan text default 'free',  -- 'free' | 'pro' | 'team'
  stripe_customer_id text,   -- null jusqu'à phase 2
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

## Multi-tenancy — Plan Équipe (99€/mois, utilisateurs illimités)

### Concept
Un abonné Plan Équipe crée une **organisation** (ex: "Groupe Mercure Lyon").
Il invite des membres par email. Tous partagent le même dashboard, profil établissement et alertes.
L'owner gère les accès — les membres n'ont que l'accès lecture + alertes.

---

### Schéma Supabase — tables supplémentaires

```sql
-- Organisation (l'entité facturable)
create table organisations (
  id            uuid primary key default gen_random_uuid(),
  nom           text not null,
  plan          text default 'team',  -- 'team' uniquement pour l'instant
  owner_id      uuid references auth.users not null,
  created_at    timestamptz default now()
);

-- Membres de l'organisation
create table organisation_members (
  id        uuid primary key default gen_random_uuid(),
  org_id    uuid references organisations on delete cascade,
  user_id   uuid references auth.users on delete cascade,
  role      text default 'member',  -- 'owner' | 'member'
  invited_email text,               -- email avant que l'invité crée son compte
  joined_at timestamptz default now(),
  unique(org_id, user_id)
);

-- Modifier etablissements : rattacher à org_id plutôt qu'à user_id
-- alter table etablissements add column org_id uuid references organisations;
-- Un établissement appartient à une org (plan team) ou à un user (plan pro)
```

### Règles d'accès
- `owner` : invite, retire des membres, voit la page Gestion équipe, gère le plan
- `member` : accès dashboard complet + alertes, pas de gestion d'équipe
- Un user peut appartenir à plusieurs orgs (cas multi-groupes)

---

### Middleware — vérification plan

```typescript
// middleware.ts — logique plan
async function getUserPlan(userId: string) {
  // 1. Vérifier si l'user est membre d'une org Team
  const { data: membership } = await supabase
    .from('organisation_members')
    .select('org_id, role, organisations(plan)')
    .eq('user_id', userId)
    .single()

  if (membership) return { plan: 'team', role: membership.role, org_id: membership.org_id }

  // 2. Sinon vérifier son plan individuel
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .single()

  return { plan: sub?.plan || 'free', role: null, org_id: null }
}
```

---

### Page /equipe (owner uniquement)

**Composants à builder :**

```
/equipe
  ├── Liste des membres (nom, email, rôle, date d'ajout)
  ├── Bouton "Inviter un membre" → input email → envoie invitation
  ├── Bouton "Retirer" sur chaque membre (sauf owner)
  └── Badge "Owner" sur le compte principal
```

**Logique d'invitation :**
```typescript
// 1. Insérer dans organisation_members avec invited_email
// 2. Envoyer email via Resend avec lien /join?token=xxx&org_id=yyy
// 3. Quand l'invité clique → crée son compte (ou se connecte)
//    → rattacher son user_id à l'org dans organisation_members

async function inviteMember(orgId: string, email: string) {
  const token = crypto.randomUUID()
  
  await supabase.from('organisation_members').insert({
    org_id: orgId,
    invited_email: email,
    role: 'member'
  })

  await resend.emails.send({
    from: 'team@horeca.watch',
    to: email,
    subject: 'Votre accès HoReCa.Watch',
    html: `<p>Vous avez été invité à rejoindre l'espace HoReCa.Watch de votre organisation.</p>
           <a href="https://horeca.watch/join?token=${token}&org=${orgId}">Rejoindre →</a>`
  })
}
```

---

### Subnav — ajout onglet Équipe (plan team, owner uniquement)

```tsx
// Ajouter dans le subnav dashboard :
{userPlan === 'team' && userRole === 'owner' && (
  <a href="/equipe" className="subnav-item">
    Équipe
  </a>
)}
```

---

### Pricing mis à jour

| Plan | Prix | Utilisateurs | Features clés |
|---|---|---|---|
| Gratuit | 0 € | 1 | Newsletter + 3 indicateurs Food |
| Pro | 19 €/mois | 1 | Dashboard complet + profil établissement + alertes perso |
| Équipe | 99 €/mois | Illimités | Tout Pro + multi-utilisateurs + gestion d'équipe + export CSV/PDF |

