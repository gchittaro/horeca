-- Migration: champs profil étendu
alter table etablissements
  add column if not exists nom_etablissement  text,
  add column if not exists siret              text,
  add column if not exists adresse            text,
  add column if not exists ville              text,
  add column if not exists code_postal        text,
  add column if not exists telephone          text,
  add column if not exists nom_gerant         text;

-- Migration: plan Stripe
alter table etablissements
  add column if not exists plan               text not null default 'free',
  add column if not exists stripe_customer_id text;
