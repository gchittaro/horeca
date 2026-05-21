-- ============================================================
-- HoReCa.Watch — Schéma Supabase complet
-- Coller dans : Supabase Dashboard → SQL Editor → New query
-- ============================================================


-- ── 1. ÉTABLISSEMENTS ────────────────────────────────────────
create table if not exists etablissements (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users on delete cascade not null,
  org_id                uuid,  -- pour plan Team (rempli plus tard)

  type_etablissement    text,
  couverts_par_jour     integer,
  nombre_chambres       integer,
  region                text,
  fournisseurs          text,

  -- Volumes d'achats mensuels (€)
  vol_viandes           numeric default 0,
  vol_laitiers          numeric default 0,
  vol_cafe              numeric default 0,
  vol_farine            numeric default 0,
  vol_huiles            numeric default 0,
  vol_energie           numeric default 0,

  -- Préférences alertes
  alert_surcout         boolean default true,
  alert_geopolitique    boolean default true,
  alert_reglementation  boolean default true,
  alert_rapport_pdf     boolean default false,
  seuil_alerte_euros    numeric default 200,

  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),

  unique(user_id)
);

alter table etablissements enable row level security;

create policy "Utilisateur voit son propre établissement"
  on etablissements for select
  using (auth.uid() = user_id);

create policy "Utilisateur modifie son propre établissement"
  on etablissements for all
  using (auth.uid() = user_id);


-- ── 2. INDICATEURS ───────────────────────────────────────────
create table if not exists indicateurs (
  id            uuid primary key default gen_random_uuid(),
  categorie     text not null,  -- 'food' | 'boissons' | 'energie' | 'rh' | 'juridique' | 'geopolitique'
  nom           text not null,
  valeur        numeric,
  unite         text,
  variation_pct numeric,
  direction     text,           -- 'hausse' | 'baisse' | 'stable'
  source        text,
  note          text,
  fetched_at    timestamptz default now(),
  semaine       integer,
  annee         integer
);

alter table indicateurs enable row level security;

-- Indicateurs visibles par tous les utilisateurs connectés
create policy "Indicateurs lisibles par les utilisateurs connectés"
  on indicateurs for select
  using (auth.role() = 'authenticated');

-- Seul le service_role peut insérer (cron)
create policy "Service role peut insérer des indicateurs"
  on indicateurs for insert
  with check (auth.role() = 'service_role');


-- ── 3. SIGNAUX GÉOPOLITIQUES ─────────────────────────────────
create table if not exists signaux_geopolitiques (
  id              uuid primary key default gen_random_uuid(),
  titre           text not null,
  description     text,
  zone            text,
  produits_lies   text[],
  impact          text,         -- 'hausse' | 'baisse' | 'incertain'
  impact_probable text,
  horizon         text,
  intensite       text,         -- 'faible' | 'modérée' | 'élevée'
  source          text,
  action_recommandee text,
  fetched_at      timestamptz default now()
);

alter table signaux_geopolitiques enable row level security;

create policy "Signaux lisibles par les utilisateurs connectés"
  on signaux_geopolitiques for select
  using (auth.role() = 'authenticated');

create policy "Service role peut insérer des signaux"
  on signaux_geopolitiques for insert
  with check (auth.role() = 'service_role');


-- ── 4. ALERTES ───────────────────────────────────────────────
create table if not exists alertes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users on delete cascade,  -- null = alerte globale
  type          text,   -- 'surcout' | 'geopolitique' | 'reglementation' | 'signal'
  titre         text not null,
  description   text,
  severite      text,   -- 'high' | 'medium' | 'low'
  produit_lie   text,
  deadline      date,
  date_application date,
  action_requise text,
  lu            boolean default false,
  created_at    timestamptz default now()
);

alter table alertes enable row level security;

create policy "Utilisateur voit ses alertes et les alertes globales"
  on alertes for select
  using (user_id is null or auth.uid() = user_id);

create policy "Utilisateur peut marquer ses alertes comme lues"
  on alertes for update
  using (auth.uid() = user_id);

create policy "Service role peut insérer des alertes"
  on alertes for insert
  with check (auth.role() = 'service_role');


-- ── 5. SUBSCRIPTIONS ─────────────────────────────────────────
-- Vide pour l'instant — prête pour Stripe (phase 2)
create table if not exists subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid references auth.users on delete cascade unique,
  plan                    text default 'free',  -- 'free' | 'pro' | 'team'
  stripe_customer_id      text,
  stripe_subscription_id  text,
  current_period_end      timestamptz,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

alter table subscriptions enable row level security;

create policy "Utilisateur voit son abonnement"
  on subscriptions for select
  using (auth.uid() = user_id);


-- ── 6. ORGANISATIONS (plan Team) ─────────────────────────────
create table if not exists organisations (
  id          uuid primary key default gen_random_uuid(),
  nom         text not null,
  plan        text default 'team',
  owner_id    uuid references auth.users on delete cascade not null,
  created_at  timestamptz default now()
);

alter table organisations enable row level security;

create policy "Owner voit son organisation"
  on organisations for select
  using (auth.uid() = owner_id);

create policy "Owner modifie son organisation"
  on organisations for all
  using (auth.uid() = owner_id);


-- ── 7. MEMBRES D'ORGANISATION ────────────────────────────────
create table if not exists organisation_members (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid references organisations on delete cascade,
  user_id       uuid references auth.users on delete cascade,
  role          text default 'member',  -- 'owner' | 'member'
  invited_email text,
  joined_at     timestamptz default now(),
  unique(org_id, user_id)
);

alter table organisation_members enable row level security;

create policy "Membres voient leur organisation"
  on organisation_members for select
  using (auth.uid() = user_id);

create policy "Owner gère les membres"
  on organisation_members for all
  using (
    exists (
      select 1 from organisations
      where id = org_id and owner_id = auth.uid()
    )
  );


-- ── 8. SEED — données mock semaine 21, 2026 ──────────────────
insert into indicateurs (categorie, nom, valeur, unite, variation_pct, direction, source, semaine, annee) values
  ('food',      'Café arabica',      5.34,  '€/livre',    11.2,  'hausse', 'ICE NY',        21, 2026),
  ('food',      'Bœuf haché 15%',    7.85,  '€/kg',        4.7,  'hausse', 'FranceAgriMer', 21, 2026),
  ('food',      'Cacao brut',        6840,  '€/tonne',    -5.2,  'baisse', 'ICE',           21, 2026),
  ('food',      'Lait entier',       415,   '€/1 000 L',   3.1,  'hausse', 'Atla',          21, 2026),
  ('food',      'Farine T55',        28.5,  '€/quintal',   0,    'stable', 'Matif',         21, 2026),
  ('food',      'Huile tournesol',   1120,  '€/tonne',    -2.8,  'baisse', 'Matif',         21, 2026),
  ('energie',   'Électricité spot',  82.4,  '€/MWh',      -6.1,  'baisse', 'EPEX',          21, 2026),
  ('boissons',  'Vin rosé Provence', 3.2,   '€/litre',     1.4,  'hausse', 'FranceAgriMer', 21, 2026),
  ('boissons',  'Bière houblon',     2.8,   '€/litre',     2.1,  'hausse', 'Eurostat',      21, 2026);

insert into signaux_geopolitiques (titre, description, zone, produits_lies, impact, horizon, intensite, source) values
  (
    'Sécheresse Côte d''Ivoire — tension cacao',
    'Intensification médiatique +38% sur 7j. Probabilité de hausse élevée dans 4–6 semaines.',
    'Côte d''Ivoire', ARRAY['cacao'], 'hausse', '4–6 semaines', 'élevée', 'GDELT'
  ),
  (
    'Tensions Mer Rouge — épices et riz',
    'Détournements maritimes actifs. Routes Asie-Europe allongées de 10–14 jours.',
    'Mer Rouge', ARRAY['épices', 'riz'], 'hausse', 'Surveillance active', 'modérée', 'GDELT'
  ),
  (
    'Brésil café — stabilisation probable',
    'Pluies annoncées zone arabica. Signal de détente dans 3–4 semaines.',
    'Brésil', ARRAY['café'], 'baisse', '3–4 semaines', 'faible', 'GDELT'
  );

insert into alertes (user_id, type, titre, description, severite, lu) values
  (null, 'reglementation', 'Décret affichage prix cartes — applicable le 01/09/2026', 'Mention TTC et TVA distincte obligatoire sur les menus. 15 semaines pour se mettre en conformité.', 'medium', false),
  (null, 'rh',             'SMIC horaire revalorisé au 01/05 — grilles HCR à mettre à jour', 'Nouveau taux : 12,08 €/h. Convention collective HCR impactée dès juin 2026.', 'high', false);


-- ── Fin du schéma ─────────────────────────────────────────────
