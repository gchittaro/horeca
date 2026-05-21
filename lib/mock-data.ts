export const mockIndicateurs = [
  { id: '1', categorie: 'food',      nom: 'Café arabica',      valeur: 5.34,  unite: '€/livre',   variation_pct:  11.2, source: 'ICE NY',        semaine: 21, annee: 2026 },
  { id: '2', categorie: 'food',      nom: 'Bœuf haché 15%',    valeur: 7.85,  unite: '€/kg',      variation_pct:   4.7, source: 'FranceAgriMer', semaine: 21, annee: 2026 },
  { id: '3', categorie: 'food',      nom: 'Cacao brut',         valeur: 6840,  unite: '€/tonne',   variation_pct:  -5.2, source: 'ICE',           semaine: 21, annee: 2026 },
  { id: '4', categorie: 'food',      nom: 'Lait entier',        valeur: 415,   unite: '€/1 000 L', variation_pct:   3.1, source: 'Atla',          semaine: 21, annee: 2026 },
  { id: '5', categorie: 'food',      nom: 'Farine T55',         valeur: 28.5,  unite: '€/quintal', variation_pct:   0,   source: 'Matif',         semaine: 21, annee: 2026 },
  { id: '6', categorie: 'food',      nom: 'Huile tournesol',    valeur: 1120,  unite: '€/tonne',   variation_pct:  -2.8, source: 'Matif',         semaine: 21, annee: 2026 },
  { id: '7', categorie: 'energie',   nom: 'Électricité spot',   valeur: 82.4,  unite: '€/MWh',     variation_pct:  -6.1, source: 'EPEX',          semaine: 21, annee: 2026 },
  { id: '8', categorie: 'boissons',  nom: 'Vin rosé Provence',  valeur: 3.2,   unite: '€/litre',   variation_pct:   1.4, source: 'FranceAgriMer', semaine: 21, annee: 2026 },
  { id: '9', categorie: 'boissons',  nom: 'Bière houblon',      valeur: 2.8,   unite: '€/litre',   variation_pct:   2.1, source: 'Eurostat',      semaine: 21, annee: 2026 },
]

export const mockSignaux = [
  {
    id: '1',
    titre: "Sécheresse Côte d'Ivoire — tension cacao",
    description: "GDELT détecte une intensification médiatique +38% sur 7j. Probabilité de hausse élevée dans 4–6 semaines.",
    zone: "Côte d'Ivoire",
    produits_lies: ['cacao'],
    impact: 'hausse',
    horizon: '4–6 semaines',
    source: 'GDELT',
    positive: false,
  },
  {
    id: '2',
    titre: "Tensions Mer Rouge — épices et riz",
    description: "Détournements maritimes actifs. Routes Asie-Europe allongées de 10–14 jours.",
    zone: "Mer Rouge",
    produits_lies: ['épices', 'riz'],
    impact: 'hausse',
    horizon: 'Surveillance active',
    source: 'GDELT',
    positive: false,
  },
  {
    id: '3',
    titre: "Brésil café — stabilisation probable",
    description: "Pluies annoncées zone arabica. Signal de détente dans 3–4 semaines.",
    zone: "Brésil",
    produits_lies: ['café'],
    impact: 'baisse',
    horizon: '3–4 semaines',
    source: 'GDELT',
    positive: true,
  },
]

export const mockAlertes = [
  {
    id: '1',
    type: 'surcout',
    titre: "Café arabica — seuil de +10% franchi",
    description: "Votre seuil d'alerte personnalisé a été déclenché. Voir signaux géopolitiques Brésil.",
    severite: 'high',
    lu: false,
    time_display: "Aujourd'hui",
  },
  {
    id: '2',
    type: 'reglementation',
    titre: "SMIC horaire revalorisé au 01/05 — grilles HCR à mettre à jour",
    description: "Nouveau taux : 12,08 €/h. Convention collective HCR impactée dès juin 2026.",
    severite: 'medium',
    lu: false,
    time_display: "01/05",
  },
  {
    id: '3',
    type: 'reglementation',
    titre: "Décret affichage prix cartes — applicable le 01/09/2026",
    description: "Mention TTC et TVA distincte obligatoire. Délai de mise en conformité : 15 semaines.",
    severite: 'low',
    lu: false,
    time_display: "Sem. 18",
  },
]

export const tickerItems = [
  { name: 'Café arabica',       value: '5,34 €',       change: '+11,2%', up: true },
  { name: 'Cacao',              value: '6 840 €/t',    change: '−5,2%',  up: false },
  { name: 'Électricité spot',   value: '82,40 €/MWh',  change: '−6,1%',  up: false },
  { name: 'Bœuf haché',         value: '7,85 €/kg',    change: '+4,7%',  up: true },
  { name: 'Indice panier CHR',  value: '124,3',         change: '+2,1%',  up: true },
  { name: 'Lait entier',        value: '415 €/kL',     change: '+3,1%',  up: true },
  { name: 'Farine T55',         value: '28,50 €/qtx',  change: 'stable', up: null },
  { name: 'Huile tournesol',    value: '1 120 €/t',    change: '−2,8%',  up: false },
]
