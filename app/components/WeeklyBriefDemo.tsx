'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IconBrain, IconChartLine, IconBuildingStore, IconBell } from '@tabler/icons-react'

const roles = [
  { key: 'directeur',  label: '🏨 Directeur' },
  { key: 'chef',       label: '👨‍🍳 Chef de cuisine' },
  { key: 'acheteur',   label: '🛒 Acheteur' },
  { key: 'daf',        label: '💼 DAF / Comptable' },
  { key: 'rh',         label: '👥 RH' },
]

const briefs: Record<string, string[]> = {
  directeur: [
    '🛒 Négociez vos contrats énergie avant le 15 juin — pic estival attendu (+12% sur l\'électricité)',
    '📉 Bœuf entrecôte en baisse de 8% cette semaine — opportunité pour retravailler la carte',
    '⚠️ Tensions logistiques en mer Baltique — anticiper délais sur boissons importées (3-4 semaines)',
    '💶 Impact food cost estimé ce mois : +1 840€ sur votre profil (hausse café + huile d\'olive)',
    '📋 Convention collective HCR : nouveau barème de salaires applicable au 1er juillet 2026',
  ],
  chef: [
    '🚫 Évitez la daurade cette semaine — prix en pic saisonnier (+18%), tension Méditerranée',
    '✅ Maquereau au meilleur prix depuis 6 semaines — idéal pour mise en avant carte',
    '🔄 Substituez l\'huile d\'olive par tournesol sur les cuissons — économie estimée 0,40€/couvert',
    '🌿 Tomates cerises : -34% vs il y a 3 semaines — profitez-en avant la remontée de septembre',
    '⏳ Planifiez vos commandes de truffes maintenant — récolte d\'automne sous pression climatique',
  ],
  acheteur: [
    '🟢 Achetez céréales et farine maintenant — récolte européenne abondante, prix au plus bas',
    '🔴 Attendez sur le café arabica — volatilité forte, pic probable dans 2-3 semaines',
    '🔄 Renégociez votre contrat volaille — le marché a baissé de 11%, votre fournisseur ne l\'a pas répercuté',
    '⚠️ Huile de palme : signal géopolitique négatif (Indonésie) — constituez un stock tampon',
    '📦 Anticipez les commandes de boissons gazeuses — grève annoncée chez un distributeur majeur',
  ],
  daf: [
    '💶 Charges food cost en hausse estimée de +2 340€ ce mois vs mois dernier sur votre profil',
    '📊 Énergie : votre poste le plus exposé cette semaine (+14% gaz) — vérifiez votre contrat',
    '💡 Envisagez une révision tarifaire sur les menus à +5% — food cost dépasse 34% sur 3 catégories',
    '📋 TVA restauration : aucun changement réglementaire cette semaine',
    '⏳ Prévision à 30 jours : pression modérée — scénario central à +1 200€ sur les charges',
  ],
  rh: [
    '⚠️ Grève annoncée chez Transgourmet le 3 juin — anticiper plan B approvisionnement avec les équipes',
    '📋 Nouveau barème convention collective HCR applicable au 1er juillet — mettre à jour les fiches de paie',
    '👥 Forte chaleur prévue semaine 23 — revoir les plannings de cuisine (amplitude horaire)',
    '🚛 Tensions logistiques sur 2 distributeurs — informer les équipes réception d\'éventuels retards',
    '📄 DGCCRF : nouvelle obligation d\'affichage allergènes en vigueur depuis le 1er mai — vérifier conformité',
  ],
}

const avantages = [
  { Icon: IconBrain,         title: 'Brief IA chaque lundi',          desc: 'Adapté à votre rôle, basé sur les données réelles de la semaine.' },
  { Icon: IconChartLine,     title: 'Dashboard complet',               desc: '18 indicateurs en temps réel + signaux géopolitiques + archives 12 mois.' },
  { Icon: IconBuildingStore, title: 'Impact sur votre établissement',  desc: 'Calcul personnalisé en euros selon vos volumes d\'achats réels.' },
  { Icon: IconBell,          title: 'Alertes personnalisées',          desc: 'Notifié dès qu\'un indicateur dépasse votre seuil d\'impact défini.' },
]

export default function WeeklyBriefDemo() {
  const [role, setRole] = useState('directeur')
  const roleLabel = roles.find(r => r.key === role)?.label ?? ''

  return (
    <section style={{ background: '#26215C', padding: '64px 32px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>

        {/* Accroche */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7F77DD', fontWeight: 500 }}>
            Plan Pro · Brief hebdomadaire
          </div>
          <div style={{ fontSize: 28, fontWeight: 500, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Ce que vous recevez chaque lundi matin
          </div>
          <div style={{ fontSize: 14, color: '#AFA9EC', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
            Un brief opérationnel généré par IA, adapté à votre rôle, basé sur les données de marché de la semaine.
          </div>
        </div>

        {/* Sélecteur de rôle */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {roles.map(r => (
            <button
              key={r.key}
              onClick={() => setRole(r.key)}
              style={{
                fontSize: 13,
                padding: '7px 16px',
                borderRadius: 20,
                border: '1px solid',
                borderColor: role === r.key ? '#7F77DD' : '#3C3489',
                background: role === r.key ? '#7F77DD' : 'transparent',
                color: role === r.key ? '#fff' : '#AFA9EC',
                cursor: 'pointer',
                fontWeight: role === r.key ? 500 : 400,
                transition: 'all 0.15s',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Bloc brief */}
        <div style={{ background: '#1F1A4A', border: '1px solid #3C3489', borderRadius: 14, overflow: 'hidden' }}>
          {/* En-tête */}
          <div style={{ padding: '14px 20px', borderBottom: '0.5px solid #3C3489', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, color: '#AFA9EC', display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 14 }}>🧠</span>
              Brief du lundi — semaine du 26 mai 2026
            </div>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#7F77DD', color: '#fff', fontWeight: 500 }}>
              {roleLabel}
            </span>
          </div>

          {/* Lignes de recommandations */}
          <div style={{ padding: '6px 0' }}>
            {briefs[role].map((line, i) => (
              <div
                key={i}
                style={{
                  padding: '13px 20px',
                  fontSize: 13,
                  color: '#D3D1C7',
                  lineHeight: 1.6,
                  borderBottom: i < briefs[role].length - 1 ? '0.5px solid #2E2860' : 'none',
                }}
              >
                {line}
              </div>
            ))}
          </div>

          {/* Pied */}
          <div style={{ padding: '12px 20px', borderTop: '0.5px solid #3C3489', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#7F77DD', lineHeight: 1.5 }}>
              Exemple fictif à titre d&apos;illustration — votre brief est généré chaque lundi à partir des données réelles du marché.
            </div>
          </div>
        </div>

        {/* 4 avantages */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {avantages.map(a => (
            <div
              key={a.title}
              style={{ background: '#F8F8FC', border: '0.5px solid #AFA9EC', borderRadius: 12, padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#26215C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <a.Icon size={17} color="#7F77DD" />
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#26215C', lineHeight: 1.4 }}>{a.title}</div>
              <div style={{ fontSize: 11, color: '#5F5E5A', lineHeight: 1.6 }}>{a.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <Link
            href="/signup?plan=pro"
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: '#fff',
              background: '#7F77DD',
              padding: '14px 36px',
              borderRadius: 10,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Essayer le plan Pro — 99€/mois
          </Link>
          <div style={{ fontSize: 11, color: '#AFA9EC' }}>
            soit 24,75 € par semaine
          </div>
          <div style={{ fontSize: 11, color: '#AFA9EC' }}>
            Sans engagement. Résiliable à tout moment.
          </div>
        </div>

      </div>
    </section>
  )
}
