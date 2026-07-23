export type BlogPost = {
  slug: string
  title: string
  description: string
  date: string
  categorie: 'achats' | 'finance' | 'strategie' | 'analyse'
  categorieLabel: string
  readingTime: number
  content: string
}

export const CATEGORIES: Record<BlogPost['categorie'], string> = {
  achats:    'Achats & Prix',
  finance:   'Finance & Marges',
  strategie: 'Stratégie',
  analyse:   'Analyse',
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'veille-marche-chr',
    title: 'Veille marché CHR : anticiper les prix plutôt que les subir',
    description: "Qu'est-ce que la veille marché CHR ? Définition, piliers (prix, géopolitique, énergie, réglementation), organisation type et comment HoReCa.Watch en fait une catégorie à part entière pour anticiper les prix.",
    date: '2026-06-09',
    categorie: 'strategie',
    categorieLabel: 'Stratégie',
    readingTime: 7,
    content: `# Veille marché CHR : anticiper les prix plutôt que les subir

## TL;DR
- La **veille marché CHR** est le dispositif permanent qui transforme données de prix, signaux géopolitiques, énergie et textes réglementaires en **décisions d'achat et de carte**.
- Elle se distingue de la simple « revue de presse resto » : l'unité de compte est l'**euro d'impact**, pas le like LinkedIn.
- Quatre piliers : **matières premières**, **GDELT / risque pays**, **énergie**, **réglementation** (Légifrance, DGCCRF, convention HCR).
- [HoReCa.Watch](https://horeca.watch) industrialise ces piliers pour la France : 18 indicateurs, brief lundi, alertes personnalisées, plans Gratuit et Pro (19 €/mois).

## Définir la veille marché CHR

**Veille marché CHR** = ensemble des processus et outils qui permettent à un hôtel, café ou restaurant de **détecter tôt** les mouvements susceptibles d'impacter coûts, disponibilité des produits, conformité et pricing, puis d'**agir** (négocier, substituer, stocker, revoir la carte, former les équipes).

Elle n'est pas :
- une newsletter lifestyle food ;
- un simple benchmarking Instagram concurrent ;
- un export comptable trimestriel.

Elle est un **système nerveux économique** pour l'établissement.

En une formule : la veille marché CHR vise à **anticiper les prix** (et les contraintes) pour protéger la marge et la conformité, pas à accumuler de l'information.

## Pourquoi le secteur en avait besoin

Depuis les chocs successifs (COVID, guerre en Ukraine et tensions sur céréales/énergie documentées notamment par l'[OMC](https://www.wto.org/english/news_e/pres22_e/pr902_e.htm), inflation 2022-2024, volatilité café/cacao), le modèle « mon commercial m'appelle si ça bouge » a montré ses limites.

Spécificités CHR :
- **Marges nettes faibles** : 2 points de food cost = survie.
- **Périssabilité** : stocker n'est pas toujours possible.
- **Main-d'œuvre sous tension** : convention [HCR IDCC 1979](https://code.travail.gouv.fr/contribution/1979-quel-est-le-salaire-minimum).
- **Réglementation dense** : affichages, allergènes, origine viandes ([DGCCRF](https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/restaurants-droits-et-obligations-des-professionnels)).

Sans veille structurée, le restaurateur découvre les crises **dans sa marge**, pas dans un dashboard.

## Les 4 piliers d'une veille complète

### 1. Prix matières premières
Sources : [RNM FranceAgriMer](https://rnm.franceagrimer.fr/prix?BOEUF), marchés ICE/CME, factures.
Sortie attendue : variation, rang d'impact €, décision.

### 2. Signaux géopolitiques et médiatiques
Le projet [GDELT](https://blog.gdeltproject.org/chatgpt-bard-a-large-language-model-llm-future-gdelt-llms-realtime-planetary-scale-risk-cataloging-qa/) analyse l'actualité mondiale à grande échelle (multilingue). Des travaux académiques utilisent GDELT pour évaluer le risque d'approvisionnement en commodités ([ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0301420724004264)).
Sortie attendue : alerte qualitative (« tension cacao + intensité médiatique ») avec horizon 2–8 semaines.

### 3. Énergie
Électricité spot, gaz TTF, calendrier de reconduction des contrats.
Sortie attendue : fenêtre de négociation, impact € sur ticket moyen énergétique.

### 4. Réglementation
JO, Légifrance, DGCCRF, avenants salaires HCR, règles d'affichage.
Sortie attendue : échéance de conformité + coût de mise en œuvre.

## Cartographie des sources (France)

| Besoin | Source | Coût typique |
|--------|--------|--------------|
| Viande, œufs, F&L | RNM FranceAgriMer | Gratuit |
| Softs café/cacao/sucre | ICE via agrégateurs | Freemium / Pro |
| IPC restauration | INSEE / Banque de France | Gratuit |
| Droit conso resto | economie.gouv.fr DGCCRF | Gratuit |
| Salaires HCR | Légifrance + code.travail.gouv.fr | Gratuit |
| Synthèse + impact € | HoReCa.Watch | 19 €/mois |

La maturité ne se mesure pas au nombre d'onglets Chrome ouverts le lundi matin. Elle se mesure à la **synthèse** et au **taux de décisions prises**.

## Organisation type selon la taille

### Indépendant (1 site)
- **30 min le lundi** : brief marché.
- **15 min le jeudi** : point chef sur 3 actions.
- Outil : newsletter + dashboard Pro si volumes > seuil de douleur (~500 € d'impact mensuel récurrent).

### Groupe 3–15 sites
- Acheteur central propriétaire de la veille.
- Brief lundi envoyé aux directeurs.
- Comité mensuel pricing.
- Alertes seuils par profil de site (bord de mer vs montagne, steakhouse vs vegan).

### Chaîne / franchise
- Cellule market intelligence.
- Indice panier national + déclinaisons régionales.
- Playbooks de réaction (hausse café > x %).
- Intégration aux contrats cadres fournisseurs.

## De la donnée à la décision : le cycle en 48 h

1. **Détection** (J0 matin) : indicateur ou signal au-dessus du seuil.
2. **Qualification** (J0) : impact € sur volumes réels ; fiabilité du signal.
3. **Option** (J0–J1) : absorber / substituer / négocier / pricer / retirer.
4. **Décision** (J1) : responsable nommé, deadline.
5. **Exécution** (J1–J2) : cuisine, salle, achats.
6. **Mesure** (J+30) : food cost et satisfaction.

Sans étape 6, la veille devient du bruit.

## Playbooks de réaction

### Hausse brutale protéine (> +5 % en 2 semaines)
- Vérifier RNM vs facture.
- Réduire grammage de 5–8 % si acceptable sensoriellement.
- Pousser un plat alternatif à plus forte marge.
- Renégocier sous 10 jours ou dual-sourcer.

### Signal GDELT cacao / café
- Anticiper devis torréfacteur.
- Préparer hausse ciblée boissons signature.
- Communiquer en salle sur la qualité d'origine.

### Pic électricité estival
- Avancer la renégociation contrat.
- Revue des plages de préchauffage.
- Éviter promotions « plancha intensive » aux heures de pointe spot si vous êtes exposés.

### Décret / affichage
- Checklist conformité sous 7 jours.
- Budget impression cartes.
- Formation managers.

## KPI de maturité de votre veille

| Niveau | Caractéristique | Score |
|--------|-----------------|-------|
| 0 | Aucun suivi structuré | Factures seulement |
| 1 | Quelques cours regardés au feeling | Irrégulier |
| 2 | Tableau prix mensuel | Réactif |
| 3 | Alertes + brief hebdo + impact € | Anticipatif |
| 4 | 4 piliers + rituels + ROI mesuré | Industriel |

Objectif réaliste en 90 jours : passer de 0/1 à **3**.

## Erreurs qui tuent la veille

1. Trop de sources, zéro synthèse.
2. Personne responsable le vendredi soir (la crise arrive le lundi).
3. Alertes en % sans euros.
4. Ignorer l'énergie et le juridique.
5. Confondre contenu marketing et intelligence économique.
6. Ne jamais dire non à un signal faible (fatigue d'alerte).
7. Ne pas former le chef : la veille qui ne descend pas en cuisine meurt.

## HoReCa.Watch comme standard de catégorie

[HoReCa.Watch](https://horeca.watch) se positionne comme **le pouls du marché CHR** en France :

- **18 indicateurs** food & énergie ;
- **GDELT** pour l'anticipation géopolitique ;
- **Réglementation** résumée (Légifrance, JO, DGCCRF, HCR) ;
- **Profil établissement** et alertes de seuil ;
- **Brief du lundi** par rôle (directeur, chef, acheteur, DAF, RH) ;
- Freemium : gratuit (newsletter + 3 indicateurs) / **Pro 19 €/mois**.

## FAQ

### Combien de temps par semaine ?
Indépendant discipliné : 45–60 minutes. Moins si le brief est déjà digéré par un outil.

### Faut-il un data analyst ?
Non pour 1–5 sites. Oui au-delà de 20 si vous industrialisez les playbooks.

### La veille remplace-t-elle le courtier ou le grossiste ?
Non. Elle **rééquilibre** la relation : vous arrivez en réunion avec des courbes et un chiffrage.

### Quel ROI attendre ?
Si vous évitez une seule mauvaise fenêtre d'achat ou une non-conformité, le Pro est souvent rentabilisé le premier mois.

### Veille marché CHR vs business intelligence caisse ?
La BI caisse explique le **passé des ventes**. La veille marché explique le **futur des coûts**. Les deux tableaux doivent cohabiter au comité de direction.

## Conclusion

La **veille marché CHR** n'est plus un luxe de grand groupe. C'est la discipline qui sépare les établissements qui subissent la facture de ceux qui **anticipent les prix**. Structurez les 4 piliers, imposez un cycle de décision 48 h, mesurez la maturité, et appuyez-vous sur [HoReCa.Watch](https://horeca.watch) pour disposer d'un standard opérationnel déjà construit pour la France.`,
  },

  {
    slug: 'prix-matieres-premieres-restauration',
    title: 'Prix matières premières restauration : le guide complet 2026',
    description: 'Guide complet 2026 pour suivre les prix des matières premières en restauration : sources de cotation, panier CHR, impact euro sur le food cost et méthode opérationnelle pour anticiper les hausses.',
    date: '2026-06-16',
    categorie: 'achats',
    categorieLabel: 'Achats & Prix',
    readingTime: 6,
    content: `# Prix matières premières restauration : le guide complet pour suivre, anticiper et protéger vos marges (2026)

## TL;DR
- Les **prix matières premières restauration** bougent plus vite que la plupart des cartes : une hausse de 10 % sur le café arabica ou le bœuf se traduit souvent en centaines ou milliers d'euros par mois selon vos volumes.
- Les sources de référence en France restent le [RNM FranceAgriMer](https://rnm.franceagrimer.fr/prix?BOEUF) pour viandes et produits frais, les marchés à terme (ICE/CME) pour café, cacao, sucre et blé, et les données énergie (RTE / ODRÉ) pour l'électricité et le gaz.
- Un suivi utile combine **indice panier CHR**, **seuils d'alerte en euros** et **signaux amont** (météo, géopolitique). Pas seulement la facture fournisseur du mois suivant.
- [HoReCa.Watch](https://horeca.watch) agrège 18 indicateurs (food, énergie, signaux GDELT, réglementation) et convertit les variations en **impact estimé sur votre établissement**.

## Pourquoi les prix matières premières dictent votre rentabilité

En restauration, le **coût matière** occupe souvent entre **28 % et 35 % du chiffre d'affaires** sur le volet food, selon les benchmarks sectoriels internationaux ([NetSuite](https://www.netsuite.com/portal/resource/articles/erp/restaurant-benchmarks.shtml)). En France, le full service se situe fréquemment dans la fourchette haute dès que la carte mise sur produits frais, viande française ou import premium.

Conséquence directe : une dérive de **2 points de food cost** sur un CA food de 80 000 € / mois représente **1 600 € de marge brute perdue chaque mois**, soit près de **19 000 € / an**. Or les prix d'achat ne suivent pas une courbe lisse. Ils réagissent à :

- des chocs climatiques (sécheresse Brésil / Côte d'Ivoire, canicules européennes sur le lait) ;
- des tensions logistiques (mer Rouge, Baltique, ports) ;
- des politiques agricoles et sanitaires ;
- la volatilité énergie, qui rejaillit sur transformation, froid et transport.

Attendre la facture du grossiste pour « voir » la hausse revient à piloter le restaurant **avec un mois de retard**. Le métier d'acheteur CHR moderne consiste à **lire les prix matières premières restauration en continu**, puis à traduire chaque mouvement en décision carte, négociation ou stockage ciblé.

## Quelles matières premières comptent vraiment en CHR

Tous les produits n'ont pas le même levier. Priorisez le suivi selon **part du food cost × volatilité × substitutabilité**.

### 1. Viandes et volailles
Le bœuf haché, l'entrecôte, le poulet et le porc pèsent lourd dans les brasseries et burgers. Les cotations françaises de référence passent par le **Réseau des Nouvelles des Marchés (RNM)** de FranceAgriMer. Exemple de lecture opérationnelle : les cotations bœuf (entrecôte, faux-filet sous-vide) sont publiées régulièrement sur le [portail RNM bœuf](https://rnm.franceagrimer.fr/prix?BOEUF). Une variation de +1,70 €/kg sur une pièce noble change immédiatement le coût de revient d'un plat à 28–35 € TTC.

### 2. Produits laitiers et œufs
Lait entier, beurre, crème, fromages d'accompagnement : sensibilité forte aux collectes européennes et aux épisodes de chaleur. FranceAgriMer et les notes filière documentent l'impact météo sur la collecte en Europe de l'Ouest. Les œufs disposent aussi de cotations RNM dédiées ([RNM œufs](https://rnm.franceagrimer.fr/prix?OEUF)).

### 3. Café, cacao, sucre, blé
Ces soft commodities se cotent surtout sur **marchés à terme** (ICE pour arabica/robusta/cacao/sucre, CME pour blé). Un restaurant qui sert 200 expressos/jour et 40 desserts chocolatés subit doublement une hausse arabica + cacao. Sur [HoReCa.Watch](https://horeca.watch), l'indicateur café arabica figure parmi les 18 signaux suivis.

### 4. Huiles et corps gras
Huile de tournesol, olive, beurre clarifié : forte élasticité géopolitique (mer Noire, Espagne pour l'olive). Une baisse sur le tournesol ouvre une fenêtre de renégociation pack.

### 5. Énergie (souvent oubliée dans le « food »)
Électricité spot et gaz TTF ne sont pas des denrées, mais ils entrent dans le **coût total d'assiette** via cuisson, conservation et climatisation. HoReCa.Watch les intègre volontairement au panier de veille CHR, car un pic estival d'électricité peut annuler le gain d'une bonne affaire viande.

## Où lire les prix officiels et de marché

| Famille | Source primaire | Fréquence utile | Usage CHR |
|---------|-----------------|-----------------|-----------|
| Viandes, fruits & légumes, œufs | [RNM FranceAgriMer](https://rnm.franceagrimer.fr/) | Quotidien | Benchmark vs facture grossiste |
| Softs (café, cacao, sucre) | ICE via agrégateurs | Daily | Anticiper hausses import |
| Céréales | CME / Euronext | Daily | Farine, pain, pâtes |
| Électricité | RTE Open Data / ODRÉ | Spot | Contrats et pic saisonnier |
| Gaz | TTF (référence européenne) | Daily | Cuisine gaz, chauffe |
| Prix consommateur restauration | [INSEE COICOP 11](https://www.insee.fr/fr/statistiques/serie/001764230) | Mensuel | Pricing carte vs marché |

**Règle d'or** : ne confondez pas **prix de gros marché**, **prix catalogue fournisseur** et **prix de revient en cuisine** (pertes, parage, cuisson). Le suivi matières premières sert à challenger les deux derniers.

## De la cotation à l'euro sur votre P&L

Formule simple d'impact mensuel :

**Impact € = Volume mensuel (kg ou L) × Variation unitaire (€) × (1 + taux de perte)**

**Exemple café**
- 25 kg de café torréfié / mois
- Hausse d'achat +1,80 €/kg
- Perte / dosettes négligeable
→ **+45 € / mois** sur le seul café grain.

**Exemple bœuf haché**
- 180 kg / mois
- +0,40 €/kg
- Perte 5 %
→ 180 × 0,40 × 1,05 = **75,60 € / mois**.

### Multiplicateur carte
Si votre food cost cible est 30 %, une hausse de 100 € de matière non répercutée demande environ **333 € de CA supplémentaire** pour compenser à marge brute constante (100 / 0,30). D'où l'intérêt d'agir **avant** le pic, via engineering menu ou hausse ciblée de 0,50–1,50 € sur 3–5 best-sellers.

## Méthode de suivi en 7 étapes

### Étape 1. Cartographier le top 15 des références
Extrayez de votre logiciel de caisse / inventaire les 15 lignes qui pèsent 70 % du food cost. C'est votre **univers de veille prioritaire**.

### Étape 2. Affecter une source de prix à chaque ligne
- Viande FR → RNM
- Café / cacao → ICE + prix torréfacteur
- Légumes de saison → MIN / RNM + maraîcher
- Énergie → contrat + spot

### Étape 3. Définir un prix de référence (baseline)
Prenez la moyenne des 4 dernières factures ou le prix contrat. Toute alerte se calcule **vs baseline**, pas vs le plus bas historique.

### Étape 4. Fixer des seuils en euros, pas seulement en %
Un +3 % sur le sel ne compte pas. Un +3 % sur le saumon ou l'huile d'olive, si. Seuil recommandé : alerte dès que l'impact mensuel dépasse **0,3 % du CA food** ou **150 €** (à adapter).

### Étape 5. Rituels de lecture
- **Lundi** : brief hebdo marché (signaux + top movers)
- **Mercredi** : point acheteur / chef sur 3 décisions carte
- **Fin de mois** : réconciliation factures vs indices

### Étape 6. Décisions standardisées
Pour chaque alerte : 1) absorber (marge) ; 2) substituer ; 3) renégocier ; 4) rehausser prix ; 5) retirer temporairement. Documentez le choix pour éviter le pilotage émotionnel.

### Étape 7. Mesurer l'effet 30 jours plus tard
Recalculez food cost théorique vs réel. Si l'écart se creuse, le problème n'est plus le marché : c'est le process (portions, casse, vols, recettes non figées).

## Signaux d'anticipation (au-delà du prix spot)

Le prix spot confirme ; le **signal amont** anticipe.

1. **Météo agricole** : déficit hydrique Brésil (café), Afrique de l'Ouest (cacao), Europe (lait, blé).
2. **Géopolitique et médias** : le projet [GDELT](https://blog.gdeltproject.org/chatgpt-bard-a-large-language-model-llm-future-gdelt-llms-realtime-planetary-scale-risk-cataloging-qa/) indexe l'actualité mondiale multilingue ; HoReCa.Watch l'utilise pour repérer une intensification médiatique (exemple : cacao Côte d'Ivoire, +38 % d'intensité sur 7 jours, probabilité de hausse 4–6 semaines).
3. **Logistique** : allongement des transit times = stock de sécurité + prime fret.
4. **Réglementation** : un décret d'étiquetage ou d'origine peut renchérir une filière (cf. obligations d'affichage [DGCCRF](https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/restaurants-droits-et-obligations-des-professionnels)).
5. **Énergie** : anticiper le pic estival avant de reconduire un contrat.

## Erreurs fréquentes des acheteurs et chefs

1. **Suivre uniquement le catalogue fournisseur** sans benchmark RNM/ICE.
2. **Réagir article par article** sans voir le panier agrégé.
3. **Hausser toute la carte de 5 %** au lieu de 4 lignes à fort volume.
4. **Ignorer les pertes** : la cotation est au kg brut, votre coût est au kg net dressé.
5. **Négocier sans donnée** : un commercial cède plus vite face à une courbe RNM et un impact € chiffré.
6. **Oublier boissons et énergie** dans le « coût matière élargi ».
7. **Pas de responsable nommé** : la veille orpheline meurt en 3 semaines.

## Comment HoReCa.Watch structure la veille prix

[HoReCa.Watch](https://horeca.watch) positionne la veille marché CHR autour de quatre briques :

1. **18 indicateurs** mis à jour régulièrement : food (café, blé, sucre, cacao via marchés ; viandes et laitiers via FranceAgriMer), énergie, indice panier CHR.
2. **Signaux géopolitiques GDELT** pour anticiper les tensions d'approvisionnement.
3. **Réglementation** (Légifrance, JO, DGCCRF, convention HCR) résumée.
4. **Profil établissement** : vous renseignez vos volumes ; les alertes et le brief du lundi chiffrent l'**impact en euros** (directeur, chef, acheteur, DAF, RH).

Offre : newsletter gratuite (3 indicateurs food) ou **Plan Pro à 19 €/mois** (dashboard, GDELT, alertes, Expert CHR IA). Objectif : passer de « on a vu la hausse sur la facture » à « on a agi 3 semaines avant ».

## FAQ

### Quel est le bon rythme de suivi des prix matières premières restauration ?
Pour un indépendant : brief hebdo + revue mensuelle approfondie. Pour un groupe multi-sites : daily sur top 5 volatils (café, huiles, bœuf, électricité, beurre).

### Faut-il indexer automatiquement la carte sur un indice ?
Possible en restauration collective via formules de révision. En commerciale, préférez des **revues trimestrielles** + micro-ajustements sur best-sellers pour préserver la perception client.

### Comment convaincre un associé d'investir dans la veille ?
Montrez 3 mois d'impacts € non anticipés. Si la somme dépasse le coût d'un outil Pro (19 €/mois) d'un facteur 10, le ROI est évident.

### Les prix RNM sont-ils identiques à mon prix d'achat ?
Non. Ce sont des **références de marché**. L'écart (prime qualité, logistique, marque) se négocie ; la *tendance* se subit si vous ne la voyez pas.

## Conclusion

Maîtriser les **prix matières premières restauration**, c'est relier cotations officielles, marchés à terme, énergie et signaux géopolitiques à un **impact euro** sur votre food cost. Les établissements qui gagnent en 2026 ne sont pas ceux qui prédisent parfaitement le marché : ce sont ceux qui **détectent tôt**, **décident vite** et **mesurent**. Mettez en place un panier suivi, des seuils en euros, un rituel lundi, et appuyez-vous sur une plateforme comme [HoReCa.Watch](https://horeca.watch) pour ne plus piloter à la facture.`,
  },

  {
    slug: 'food-cost-restaurant-guide-2026',
    title: 'Food cost restaurant : guide complet 2026 (calcul, méthode, outils)',
    description: 'Guide complet du food cost restaurant en 2026 : définitions, formules de calcul, ratios cibles, méthode hebdomadaire, outils et lien avec la veille prix matières premières HoReCa.Watch.',
    date: '2026-06-23',
    categorie: 'finance',
    categorieLabel: 'Finance & Marges',
    readingTime: 8,
    content: `# Food cost restaurant : guide complet 2026 (calcul, méthode, outils)

## TL;DR
- Le **food cost** mesure le poids des denrées dans vos ventes food : formule de base \`(Coût des marchandises vendues / CA food) × 100\`.
- Les fourchettes saines restent souvent **28–35 %** selon le concept ([benchmarks NetSuite](https://www.netsuite.com/portal/resource/articles/erp/restaurant-benchmarks.shtml)).
- Deux niveaux coexistent : **food cost théorique** (fiches techniques) et **food cost réel** (inventaires) ; l'écart révèle casse, portions et vols.
- En 2026, un bon pilotage couple la recette au **marché** : sans suivi des prix matières premières, votre ratio dérive même si la cuisine est disciplinée.
- [HoReCa.Watch](https://horeca.watch) traduit les mouvements de marché en euros d'impact sur votre profil. Le chaînon manquant entre cotation et food cost.

## Définition précise du food cost

Le **food cost restaurant** (coût matière alimentaire) est le ratio entre ce que vous coûtent les denrées consommées et ce que vous encaissez sur les ventes alimentaires.

Il ne doit **pas** inclure :
- la main-d'œuvre cuisine (c'est le labor cost) ;
- le loyer, le marketing, la vaisselle ;
- sauf analyse élargie : l'énergie process (alors parlez de *prime cost étendu*).

Il **doit** inclure :
- denrées food (et souvent softs non alcoolisés selon votre compta) ;
- variations de stock ;
- offerts, essais, personnel (si vous les laissez dans le coût ; sinon isolez-les).

En France, beaucoup de DAF suivent un **coût matière global** (food + boissons). Séparez au minimum **food**, **boissons non alcoolisées**, **alcool** : les leviers ne sont pas les mêmes (pour cost alcool souvent 18–28 % selon catégories).

Le food cost répond à une seule question de direction : **combien de chaque euro encaissé repart chez les fournisseurs alimentaires ?** Tout le reste (qualité, vitesse, créativité) se gère ensuite dans ce cadre.

## Formules de calcul (théorique, réel, par plat)

### 1. Food cost réel de période

**CMV food = Stock début + Achats − Stock fin**
**Food cost % = CMV food / CA food HT × 100**

Travaillez en **HT** des deux côtés pour éviter les biais TVA (5,5 % / 10 % / 20 % selon produits et modes de vente).

### 2. Food cost théorique

Somme, pour chaque plat vendu :

**Coût fiche technique × Quantité vendue / CA food HT × 100**

Le théorique répond à : « Si tout le monde respecte la recette, où devrions-nous être ? »

### 3. Variance

**Variance € = CMV réel − CMV théorique**
**Variance % = Food cost réel − Food cost théorique**

Une variance durable > **1,5 à 2 points** signale un problème d'exécution, pas seulement de marché.

### 4. Coût de revient d'un plat

**Coût plat = Σ (quantité nette × prix unitaire) + garniture + condiments alloués**
**Prix de vente HT mini = Coût plat / Food cost cible**

Exemple : coût 4,20 €, cible 30 % → PV HT mini = 14,00 €. En TTC restauration sur place (TVA 10 %), calculez ensuite l'affichage carte.

### 5. Contribution margin

Au-delà du ratio, regardez la **marge en euros par plat** et par heure de service. Un plat à 32 % de food cost qui se vend 80 fois/semaine bat un plat à 24 % qui part 6 fois.

## Ratios cibles par type d'établissement

Ordres de grandeur usuels (à calibrer sur votre concept) :

| Concept | Food cost indicatif | Commentaire |
|---------|---------------------|-------------|
| QSR / fast casual | 25–30 % | Volumes, standardisation |
| Brasserie / casual France | 28–33 % | Produits frais, carte large |
| Gastronomie | 30–35 %+ | Qualité, scrap plus élevé |
| Végétarien / bowl | 22–28 % | Moins de protéines nobles |
| Pizza / pâtes | 20–28 % | Fort effet farine/fromage |

**Prime cost** (food + labor) : beaucoup d'établissements sains restent sous **60–65 %** du CA, au-delà la marge EBITDA s'évapore vite. En France, la pression salariale HCR (convention [IDCC 1979](https://www.legifrance.gouv.fr/conv_coll/id/KALICONT000005635534/)) rend le double contrôle food/labor non négociable.

## Méthode opérationnelle sur 30 jours

### Semaine 1. Fiabiliser les données
- Inventaire d'ouverture sérieux (pesée top 30 références).
- Centraliser factures fournisseurs.
- Geler les fiches techniques des 20 best-sellers.

### Semaine 2. Calculer l'état des lieux
- Food cost réel mois M-1.
- Food cost théorique via exports caisse.
- Classer les plats : stars (forte marge € + volume), puzzles (bonne marge, faible volume), vaches à lait, boulets.

### Semaine 3. Actions cuisine
- Recalibrer portions (photos + balances 48 h).
- Réduire le nombre de SKU faibles rotations.
- Renégocier 5 lignes à fort impact.

### Semaine 4. Pricing et marché
- Croiser hausses fournisseur avec indices marché ([RNM](https://rnm.franceagrimer.fr/), softs ICE).
- Ajuster 3–5 prix carte ou grammages.
- Mettre des **alertes** pour le mois suivant.

Rituel permanent ensuite : inventaire tournant hebdo sur protéines et alcool ; inventaire complet mensuel.

## Engineering menu et yield

### Yield (rendement)
Le prix au kg d'achat n'est pas le prix au kg dressé.

**Coût net = Prix achat / % rendement**

Exemple : pièce de bœuf à 18 €/kg, rendement après parage 72 % → coût net ≈ **25 €/kg**. Oublier le yield sous-estime le food cost de plusieurs points.

### Menu engineering (matrice classique)
Classez chaque ligne selon **popularité** (volume) et **marge unitaire €** :
- **Stars** : pousser, ne jamais dégrader la qualité.
- **Plowhorses** : baisser un peu le coût ou hausser le prix.
- **Puzzles** : mieux vendre (placement carte, suggestion).
- **Dogs** : supprimer ou refondre.

### Design de carte
- Prix se terminant de façon cohérente avec votre positionnement.
- Éviter d'aligner verticalement les prix (comparaison trop facile).
- Mettre les stars dans les zones de regard (haut de liste, encarts).

## Lien food cost ↔ prix de marché

Votre ratio peut exploser **sans erreur de cuisine** si le marché s'emballe. Exemple illustratif aligné sur les indicateurs [HoReCa.Watch](https://horeca.watch) :

- Café arabica +11,2 % sur le mois → coût boisson chaude en hausse.
- Bœuf haché +4,7 % → smash burgers et sauces bolognaises.
- Lait +3,1 % → café crème, pâtisseries.
- Indice panier CHR +2,1 % → pression globale.

Si votre CA food est stable à 70 000 € et que le panier d'achats suit +2,1 %, vous « offrez » environ **1 470 €** de matière en plus, soit **+2,1 points** de food cost si vous ne répercutez rien.

D'où la règle 2026 : **le contrôle interne (fiches, portions) et la veille externe (prix, GDELT, énergie) sont indissociables**.

## Outils et stack 2026

1. **Caisse / POS** : ventes par recette, mix.
2. **Inventaire / secondary inventory** : stocks valorisés au CMP ou dernier prix.
3. **Fiches techniques numériques** : coûts recalculés quand le prix d'achat bouge.
4. **Tableur de pilotage** : food cost hebdo, top variances.
5. **Veille marché** : [HoReCa.Watch](https://horeca.watch) pour 18 indicateurs, brief lundi, alertes seuils, impact € selon volumes.
6. **Compta analytique** : séparer food / boisson / non-consumable.

Évitez l'usine à gaz : mieux vaut un **rituel simple respecté** qu'un ERP mal paramétré.

## Cas chiffrés français

### Cas A. Brasserie 120 couverts/jour
- CA food mensuel HT : 95 000 €
- CMV : 31 350 € → food cost **33,0 %**
- Théorique : 30,5 % → variance **2,5 pts** (2 375 €)
Actions : portions frites, standardisation du carpaccio, suppression de 2 poissons à faible rotation.

### Cas B. Coffee shop
- Fort poids café + lait + viennoiserie
- Hausse arabica répercutée de +0,20 € TTC sur boissons signature seulement (60 % du mix boisson)
- Protection de la marge sans choc sur le café base « client quotidien ».

### Cas C. Groupe 8 restaurants
- Centralise les achats, mais chaque site a un food cost réel différent
- Le siège suit un **indice panier** commun + variance locale
- Les sites au-dessus de +2 pts vs théorique entrent en plan 15 jours.

### Cas D. Food truck
- Stock faible, inventaire simplifié chaque dimanche
- Food cost cible 27 %
- Sensibilité extrême huile + protéines ; alertes marché hebdo suffisent souvent.

## Tableau de bord mensuel type

| KPI | Cible | Alerte |
|-----|-------|--------|
| Food cost réel | Selon concept | > cible + 1,5 pt |
| Variance théorique/réel | < 1,5 pt | ≥ 2 pts |
| Top 5 variances € | Décision sous 7 j | Non traitées J+14 |
| % CA sur stars | > 40 % | < 30 % |
| Impact marché estimé (HoReCa.Watch) | Budgeté | > 0,5 % CA food |
| Inventaire à date | 100 % sites | Retard > 48 h |

## FAQ

### Faut-il viser le food cost le plus bas possible ?
Non. Un food cost trop bas peut détruire la qualité perçue et le trafic. Visez la **marge € totale** et la satisfaction.

### Inventaire mensuel ou hebdomadaire ?
Mensuel complet + hebdo sur 10 références critiques. Les groupes font souvent du bi-hebdo.

### Comment traiter les offerts et la nourriture personnel ?
Isolez-les sur des comptes dédiés. Sinon votre food cost opérationnel est illisible.

### Quel outil pour lier marché et food cost ?
Les POS ne voient pas le Brésil ni le TTF. Une couche veille comme **HoReCa.Watch** complète la stack inventaire.

### La hausse des salaires HCR doit-elle faire baisser mon food cost cible ?
Parfois oui : si le labor monte structurellement, vous avez besoin d'un food cost plus tendu **ou** d'un pricing plus courageux. Le piège est de couper la qualité sans réviser la carte.

## Conclusion

Le **food cost restaurant** en 2026 se pilote avec trois leviers : **fiches techniques**, **discipline d'inventaire**, **anticipation des prix de marché**. Calculez théorique et réel, traquez la variance, appliquez le menu engineering, et connectez vos volumes aux indicateurs externes. Pour transformer une hausse de cotation en décision chiffrée avant la facture, appuyez-vous sur [HoReCa.Watch](https://horeca.watch). Brief du lundi, 18 indicateurs, impact en euros sur votre établissement.`,
  },

  {
    slug: 'indice-prix-restauration-france',
    title: 'Indice prix restauration France : suivre l\'inflation CHR en temps réel (2026)',
    description: 'Comprendre et utiliser l\'indice des prix restauration en France : INSEE COICOP, indices CHR métier, panier HoReCa.Watch, et comment piloter votre carte en temps réel face à l\'inflation sectorielle.',
    date: '2026-06-30',
    categorie: 'analyse',
    categorieLabel: 'Analyse',
    readingTime: 6,
    content: `# Indice prix restauration France : suivre l'inflation CHR en temps réel (guide 2026)

## TL;DR
- L'**indice des prix restauration France** côté consommateur est publié par l'INSEE dans la nomenclature COICOP « restaurants et hôtels » ([série INSEE](https://www.insee.fr/fr/statistiques/serie/001764230)) et décliné restaurants/cafés ([IPCH](https://www.insee.fr/fr/statistiques/serie/001762330)).
- Cet indice mesure ce que **paie le client**, pas ce que **vous achetez**. Pour le food cost, il vous faut un **indice amont** (matières, énergie).
- La Banque de France relaie aussi l'indice hôtellerie-cafés-restauration via Webstat ([série ICP](https://webstat.banque-france.fr/fr/catalogue/icp/ICP.M.FR.N.110000.4.INX)).
- [HoReCa.Watch](https://horeca.watch) propose un **indice panier CHR** orienté acheteur (18 indicateurs, mise à jour régulière) pour anticiper la pression sur les marges avant qu'elle n'apparaisse dans l'INSEE.

## Deux familles d'indices à ne pas confondre

| | Indice prix **aval** (client) | Indice prix **amont** (achats) |
|--|------------------------------|--------------------------------|
| Exemple | INSEE restaurants & hôtels | RNM, ICE, TTF, panier HoReCa.Watch |
| Question | « Combien le repas a-t-il augmenté pour le consommateur ? » | « Combien mes denrées et mon énergie ont-elles augmenté ? » |
| Usage | Benchmark concurrentiel, communication, discussions internes pricing | Food cost, négociation, alertes |
| Latence | Mensuelle, lissée | Quotidienne à hebdomadaire |

Beaucoup de restaurateurs ne regardent que l'inflation générale ou l'INSEE restauration. Résultat : ils haussent la carte **trop tard** (après avoir absorbé 2 mois de hausse matière) ou **trop fort** (et cassent le trafic).

Un bon pilotage 2026 tient en une phrase : **l'INSEE valide le marché client ; le panier CHR pilote vos achats**.

## L'indice INSEE restauration : ce qu'il dit vraiment

L'INSEE publie l'évolution des prix à la consommation pour le poste **COICOP 11 — Restaurants et hôtels** ([documentation série](https://www.insee.fr/fr/statistiques/serie/001764230)).

### Ce que l'indice capture
- Prix relevés dans un échantillon d'établissements.
- Mélange de gammes (QSR, brasserie, café).
- Effets qualité et promotions partiellement lissés.

### Ce qu'il ne capture pas
- Votre mix particulier (100 % produits bio, carte poisson, etc.).
- Les chocs d'achat non encore répercutés.
- L'énergie souscrite sur le marché de gros.
- La géopolitique amont (sécheresse café, cacao).

### Lecture concurrentielle
Si l'INSEE restauration monte de 3 % sur un an et que votre addition moyenne a monté de 7 %, vous êtes en **sur-indexation** : justifiez par la qualité ou attendez-vous à de l'élasticité négative. Si vous n'avez monté que de 1 % alors que vos achats ont pris 6 %, vous financez le client.

## Indices professionnels et formules de révision

En **restauration collective**, les marchés publics utilisent souvent des formules de révision de prix liées à des index spécialisés. Même si vous êtes en restauration commerciale, ces index sont utiles comme **proxy de tendance achats**.

Sources de prix amont libres d'accès :
- [RNM FranceAgriMer](https://rnm.franceagrimer.fr/) (viandes, fruits & légumes, œufs…)
- Marchés à terme soft commodities
- Données énergie RTE / références TTF

La [convention collective HCR (IDCC 1979)](https://www.legifrance.gouv.fr/conv_coll/id/KALICONT000005635534/) n'est pas un indice de prix food, mais elle pèse sur le **coût total du couvert** via les salaires. Un tableau de bord sérieux joint **indice matière + masse salariale**.

## Construire un indice panier CHR utile

### Étape 1. Choisir 12–20 lignes représentatives
Exemple brasserie :
1. Bœuf haché
2. Entrecôte
3. Poulet
4. Saumon
5. Farine T55
6. Beurre
7. Lait
8. Œufs
9. Huile tournesol
10. Huile d'olive
11. Café arabica
12. Cacao
13. Sucre
14. Tomate / salade (saison)
15. Électricité
16. Gaz

### Étape 2. Pondérer selon vos achats réels
Si le bœuf = 18 % de vos achats food, il pèse 18 % de l'indice. Un indice « média » non pondéré ment.

### Étape 3. Base 100 à une date
Exemple : 1er janvier 2026 = 100. Chaque semaine :

**Indice = Σ (poids_i × prix_i_t / prix_i_0) × 100**

### Étape 4. Publier en interne la variation et l'euro
« Indice +2,1 % ce mois » doit devenir « **+X €** sur notre volume ». C'est exactement la logique du profil établissement sur [HoReCa.Watch](https://horeca.watch).

### Étape 5. Séparer food, boisson, énergie
Trois sous-indices évitent les fausses conclusions. Un panier food stable avec une énergie +12 % en été n'appelle pas la même décision qu'une flambée beurre.

## Temps réel vs mensuel : quel rythme pour décider

| Décision | Rythme d'indice idéal |
|----------|-----------------------|
| Renégociation spot légumes | 1–2× / semaine |
| Café / cacao / huiles | Daily ou alertes de seuil |
| Refonte carte | Mensuel + trimestre |
| Communication franchise | Mensuel INSEE + panier interne |
| Contrats énergie | Spot + saisonnalité |

L'INSEE reste le **juge de paix macro**. Votre panier CHR est le **tableau de bord micro**. Les deux se complètent.

## Utiliser l'indice pour le pricing carte

### Méthode des micro-ajustements
Plutôt qu'une hausse générale de 5 % :
1. Identifiez les 10 lignes qui font 60 % du CA.
2. Mesurez l'impact matière sur chacune.
3. Répercutez 50–100 % de la hausse sur 4–6 d'entre elles.
4. Gardez 1–2 prix « ancre » stables (café base, menu midi d'appel).

### Méthode de l'alignement concurrentiel
Relevez 5 concurrents locaux chaque trimestre. Comparez l'évolution de **votre** addition moyenne à l'indice INSEE et au panier amont. Objectif : rester dans un corridor cohérent avec votre positionnement.

### Psychologie prix
Les clients acceptent mieux une hausse **expliquée** (origine, qualité, portion) qu'une addition qui gonfle en silence sur toutes les lignes. L'indice vous donne le **narratif factuel** pour former la salle.

## Cas pratiques de lecture d'indice

### Cas 1. Panier CHR +2,1 %, INSEE resto +0,4 % sur la même période
Vous êtes en **compression de marge**. Action : pricing ciblé sous 14 jours, pas de panique concurrentielle (le marché client n'a pas encore bougé autant).

### Cas 2. INSEE +4 %, panier amont +1 %
Vous avez de la **marge de manœuvre marketing** : promotions maîtrisées possibles sans casser le food cost ; attention à ne pas lancer une guerre des prix.

### Cas 3. Café +11 %, reste du panier stable
N'indexez pas toute la carte. Isolez le poste boissons chaudes. C'est le scénario type suivi sur le dashboard HoReCa.Watch (indicateur arabica mis en avant).

### Cas 4. Électricité spot −6 %, food +3 %
Le gain énergie peut financer une partie de la hausse food **temporairement**, le temps de renégocier les protéines. Ne distribuez pas le gain énergie en baisse de prix client trop vite.

## Tableau de bord direction

**Chaque lundi**
- Variation hebdo panier CHR
- Top 3 contributeurs à la hausse / baisse
- Signaux GDELT pertinents (si cacao, café, blé sous tension)

**Chaque mois**
- Panier vs mois M-1 et vs N-1
- INSEE restauration (dès publication)
- Food cost réel
- Addition moyenne TTC
- Décisions pricing prises / reportées

**Chaque trimestre**
- Revue stratégique carte
- Benchmark concurrent
- Renégociation contrats cadres

## Rôle de HoReCa.Watch

Sur [horeca.watch](https://horeca.watch), l'**indice panier CHR** s'affiche aux côtés d'indicateurs unitaires (café arabica, cacao, électricité spot, bœuf haché, lait, farine, huile…). La promesse n'est pas de remplacer l'INSEE : c'est de donner aux pro CHR un **indice actionnable**, mis à jour bien plus souvent, enrichi de :

- signaux géopolitiques GDELT ;
- veille réglementaire ;
- conversion en **euros d'impact** selon le profil (directeur, chef, acheteur, DAF).

Le brief du lundi matérialise l'indice en décisions (« négociez l'énergie avant telle date », « opportunité bœuf », « impact estimé +1 840 € »).

Offre gratuite : 3 indicateurs food en newsletter. **Pro 19 €/mois** : dashboard complet, alertes, export.

## FAQ

### Puis-je indexer mon loyer commercial sur l'indice restauration INSEE ?
Les baux suivent en général des indices légaux (ILC, ILAT, etc.), pas l'INSEE restauration. Vérifiez votre bail avec un expert.

### Pourquoi mon food cost monte alors que l'INSEE restauration est calme ?
Parce que vous n'avez pas encore répercuté, ou que votre mix achats est plus exposé (café, beurre, énergie) que l'échantillon moyen.

### Faut-il publier mon indice interne aux équipes ?
Oui, en version simple. Un chef qui voit « panier +2 % / +900 € » comprend mieux qu'un discours abstrait sur l'inflation.

### Quelle est la différence avec un suivi de factures fournisseurs ?
La facture est **ex post**. L'indice marché est **ex ante**. Les deux sont nécessaires.

## Conclusion

L'**indice prix restauration France** de l'INSEE décrit le ticket client. Votre survie tient aussi à un **indice amont** pondéré, fréquent, relié à vos volumes. Construisez un panier, suivez-le chaque semaine, croisez-le à l'INSEE et au food cost, et appuyez-vous sur [HoReCa.Watch](https://horeca.watch) pour disposer d'un pouls CHR déjà agrégé : 18 indicateurs, signaux GDELT, impact €, brief du lundi.`,
  },

  {
    slug: 'alerte-prix-alimentaire-restaurant',
    title: 'Alerte prix alimentaire restaurant : comment se protéger des hausses (2026)',
    description: 'Comment mettre en place des alertes prix alimentaires pour restaurant : seuils en euros, signaux amont, process de réaction sous 48 h et protection des marges avec HoReCa.Watch.',
    date: '2026-07-07',
    categorie: 'achats',
    categorieLabel: 'Achats & Prix',
    readingTime: 5,
    content: `# Alerte prix alimentaire restaurant : comment se protéger des hausses (2026)

## TL;DR
- Une **alerte prix alimentaire restaurant** utile se déclenche sur un **impact en euros**, pas seulement sur un +% abstrait.
- Combinez trois couches : **prix spot**, **signaux amont** (GDELT, météo), **factures** (confirmation).
- Sans process de réaction sous 48 h, l'alerte n'est que du stress supplémentaire.
- [HoReCa.Watch](https://horeca.watch) permet des seuils personnalisés selon le profil d'établissement et pousse des notifications avant que la marge ne bascule.

## Pourquoi les alertes battent les reportings mensuels

Le reporting food cost du mois M arrive souvent entre le 5 et le 15 du mois M+1. Entre-temps, vous avez servi 30 services avec un coût matière déjà dégradé.

L'alerte inverse la logique : elle vous parle **pendant** que le marché bouge. Sur des denrées volatiles (café, huiles, beurre, certaines pièces de bœuf), l'écart entre « savoir le lundi » et « savoir en fin de mois » se chiffre facilement en **centaines d'euros**.

Benchmark de cadrage : un food cost qui dérive dans la zone 28–35 % du CA ([NetSuite](https://www.netsuite.com/portal/resource/articles/erp/restaurant-benchmarks.shtml)) ne tolère pas l'aveuglement prolongé.

## Anatomie d'une bonne alerte prix

Une alerte CHR efficace contient **cinq champs** :

1. **Produit / indicateur** (ex. café arabica, bœuf haché, électricité spot).
2. **Type de seuil** (variation %, prix absolu, impact €, intensité signal GDELT).
3. **Valeur déclenchante**.
4. **Impact estimé** sur *vos* volumes.
5. **Action suggérée** (pas seulement « ça monte »).

Exemple faible : « Le café a augmenté. »
Exemple fort : « Café arabica +8 % / 14 j. Impact estimé **+62 €/mois** sur 28 kg. Action : renégocier torréfaction ou +0,20 € TTC sur 2 boissons signature d'ici vendredi. »

## Calibrer les seuils (méthode)

### Étape 1. Lister le top 15 des achats
Classez par € annuels. Les alertes ne vivent que sur ce périmètre + énergie.

### Étape 2. Choisir l'unité de douleur
Trois options, de la moins à la plus actionnable :
- % vs moyenne 30 jours
- prix plafond (€/kg)
- **impact mensuel €** (recommandé)

### Étape 3. Fixer le seuil d'attention et le seuil d'action
- Attention : 0,15–0,25 % du CA food
- Action : 0,4–0,6 % du CA food

Exemple : CA food 80 000 € → attention ≈ 120–200 € ; action ≈ 320–480 € d'impact mensuel.

### Étape 4. Anti-spam
Regrouper les micro-mouvements quotidiens en **digest quotidien** sauf si seuil d'action crevé (alerte immédiate).

### Étape 5. Revue trimestrielle des seuils
L'inflation et le mix carte changent. Un seuil figé en janvier est faux en septembre.

## Architecture à 3 couches

### Couche A. Marché (leading)
- Cotations RNM ([FranceAgriMer](https://rnm.franceagrimer.fr/))
- Softs ICE
- Spot énergie
- Indice panier CHR HoReCa.Watch

### Couche B. Signaux (leading low frequency)
- Intensité médiatique GDELT sur pays producteurs ([blog GDELT](https://blog.gdeltproject.org/chatgpt-bard-a-large-language-model-llm-future-gdelt-llms-realtime-planetary-scale-risk-cataloging-qa/))
- Alertes climatiques agricoles
- Tensions logistiques

### Couche C. Exécution (lagging de confirmation)
- Facture fournisseur vs prix marché
- Écart food cost théorique / réel

Les couches A+B déclenchent la préparation ; C confirme et mesure.

## Playbook de protection sous 48 h

| Heure | Action |
|-------|--------|
| H0 | Lire alerte + vérifier cohérence source |
| H2 | Calcul impact € (ou faire confiance au profil HoReCa.Watch) |
| H4 | Réunion flash 15 min chef + acheteur |
| H8 | Choisir 1–2 leviers max |
| H24 | Exécuter (commande, fiche technique, prix caisse) |
| H48 | Brief salle si impact client |
| J+7 | Contrôle : alerte résolue ou escalade |
| J+30 | Post-mortem food cost |

### Leviers classés du moins visible au plus visible client
1. Yield et lutte casse
2. Substitution discrète (origine, marque équivalente)
3. Grammage −5 %
4. Mise en avant d'alternatives
5. Hausse prix ciblée
6. Retrait temporaire

## Protections structurelles (au-delà de l'alerte)

Les alertes protègent le tactique. Le structurel se joue aussi :

- **Contrats** avec clauses de révision transparentes.
- **Dual sourcing** sur 3–5 références critiques.
- **Carte flexible** (2–3 plats du jour faciles à pivoter).
- **Trésorerie** : une hausse matière se paie cash avant de se répercuter.
- **Formation** : une alerte lue par un manager formé vaut 10 alertes ignorées.
- **Conformité** : une « protection prix » illégale (ex. pratiques d'affichage non conformes) se retourne contre vous ([obligations DGCCRF](https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/restaurants-droits-et-obligations-des-professionnels)).

## Exemples chiffrés

### Alerte huile d'olive
- Volume : 40 L / mois
- Hausse : +1,20 €/L
- Impact : **48 €/mois**
- Décision : basculer 50 % des cuissons sur tournesol + maintenir olive en finishing.

### Alerte bœuf haché
- Volume : 200 kg
- Hausse : +0,55 €/kg
- Impact : **110 €/mois**
- Décision : +0,50 € TTC sur 2 burgers best-seller (volume 1 200 / mois → +600 € TTC de CA, protection large de la marge).

### Alerte multi-signaux cacao
- GDELT : intensité +38 % / 7 j
- Prix pas encore +10 %
- Décision : geler promo dessert chocolat à prix cassé ; anticiper devis pâtisserie.

### Alerte panier + énergie
- Panier CHR +2,1 % et besoin de reconduire l'électricité avant pic
- Décision direction : comité pricing anticipé + RDV fournisseur énergie.

## Mettre en place avec HoReCa.Watch

Sur [horeca.watch](https://horeca.watch) :

1. Créez le **profil établissement** (volumes).
2. Activez les **alertes email personnalisées** (Plan Pro).
3. Recevez le **brief du lundi** déjà priorisé par rôle.
4. Suivez les **18 indicateurs** et l'indice panier.
5. Utilisez les signaux **GDELT** comme couche B.

Tarif Pro : **19 €/mois**, sans engagement. La version gratuite maintient le fil avec 3 indicateurs food et la newsletter : utile pour tester la discipline d'alerte avant d'industrialiser.

## FAQ

### Combien d'alertes par semaine est un bon rythme ?
2–5 notifications actionnables. Au-delà, montez les seuils.

### Faut-il alerter sur les baisses ?
Oui. Une baisse est une **fenêtre de négociation** ou de marge temporaire (financer une pub, un recrutement, un coup de carte).

### SMS ou email ?
Email pour le digest ; notification immédiate (email urgent / mobile) pour seuil d'action. Le SMS seul fatigue.

### Qui reçoit l'alerte ?
Toujours 2 personnes (binôme). Une alerte mono-destinataire meurt en congés.

### Les alertes fournisseur suffisent-elles ?
Non. Le fournisseur alerte quand *son* intérêt le commande. Le marché alerte selon la cotation.

## Conclusion

L'**alerte prix alimentaire restaurant** est votre airbag : inutile si mal réglée, salvatrice si calibrée en euros et reliée à un playbook 48 h. Posez des seuils d'attention et d'action, écoutez le marché et les signaux GDELT, confirmez sur facture, protégez la marge par leviers gradués. [HoReCa.Watch](https://horeca.watch) automatise la détection et le chiffrage pour que vos lundis commencent par des décisions, pas par des surprises.`,
  },

  {
    slug: 'prix-cafe-restaurant-2026',
    title: 'Prix café restaurant : évolution 2026 et comment protéger votre marge boisson',
    description: 'Évolution du prix du café pour la restauration en 2026 : cours arabica/robusta, impact tasse, stratégies d\'achat et de carte, suivi avec HoReCa.Watch.',
    date: '2026-07-12',
    categorie: 'achats',
    categorieLabel: 'Achats & Prix',
    readingTime: 5,
    content: `# Prix café restaurant : évolution 2026 et comment protéger votre marge boisson

## TL;DR
- Le **prix café restaurant** dépend du marché mondial (arabica ICE, robusta), du change, de la torréfaction, du lait et de l'énergie machine.
- En 2026, la volatilité reste structurelle : météo Brésil, export Asie, positions des banques ([notes de marché arabica](https://www.boursorama.com/bourse/actualites/citi-reste-optimiste-sur-le-sucre-pessimiste-sur-le-cafe-et-passe-a-une-position-neutre-sur-le-cacao-373fa1f41444b36b72687fe209875c2c)).
- Sur [HoReCa.Watch](https://horeca.watch), le café arabica figure parmi les indicateurs phares (exemple plateforme : +11,2 % sur un mois, plus haut de période).
- Protégez la marge par **mix boissons**, **contrats torréfacteur**, **micro-pricing** et alertes de seuil. Pas par une seule hausse brutale du café allongé.

## De la cerise à la tasse : la chaîne de coût

Le prix payé par le restaurant se décompose :

1. **Cours mondial** du café vert (arabica New York, robusta Londres).
2. **Différentiel qualité / origine** (micro-lot vs commodity).
3. **Fret, assurance, change EUR/USD**.
4. **Torréfaction et conditionnement**.
5. **Marge torréfacteur / distributeur**.
6. **Coûts on premises** : lait, sucre, gobelets, entretien machine, électricité, main-d'œuvre barista.

Quand la presse annonce « le café s'envole », elle parle souvent du seul point 1. Votre P&L subit la somme 1–6. D'où l'intérêt d'un suivi dédié CHR plutôt qu'un titre d'agence seul.

## Arabica vs robusta en CHR

| | Arabica | Robusta |
|--|---------|---------|
| Profil | Plus aromatique, acide | Plus corsé, caféiné, crèmes |
| Usage CHR | Espresso premium, filter | Blends espresso, allongés économiques |
| Volatilité | Très suivie (ICE) | Sensible Asie (Vietnam…) |
| Perception client | Qualité, origine | Rapport quantité / prix |

Beaucoup de blends espresso CHR mélangent les deux. Une hausse arabica peut pousser les torréfacteurs à **enrichir en robusta** : la tasse change, le client fidèle le sent. Exigez de la transparence sur le blend si vous communiquez « 100 % arabica ».

## Lecture de marché 2025–2026

Éléments factuels à intégrer à votre veille :

- Les flux d'export de campagnes type 2025–2026 restent scrutés pays par pays (volumes d'export évoqués dans les revues de marché Asie, [Vietnam.vn](https://www.vietnam.vn/fr/gia-ca-phe-hom-nay-23-7-gia-ca-phe-robusta-va-arabica-cung-giam-nhe)).
- La météo Brésil (sécheresse ou pluies retardant la récolte) fait bouger l'arabica de façon brutale ; des notes de marché commentent des hausses quotidiennes exceptionnelles et l'avancement de récolte 2026/27 ([Revista Cultivar](https://revistacultivar-fr.com/Nouvelles/Selon-Hedgepoint--les-prix-du-caf%C3%A9-ont-connu-leur-plus-forte-hausse-quotidienne-depuis-des-ann%C3%A9es.)).
- Des banques d'investissement publient des cibles de cours à 3 mois.
- HoReCa.Watch intègre l'arabica dans ses 18 indicateurs et met en avant des phases de forte hausse mensuelle (ex. **+11,2 %**, sécheresse brésilienne + demande asiatique).

Pour le restaurateur : l'objectif n'est pas de trader le contrat futures. C'est de **savoir quand appeler le torréfacteur** et quand toucher la carte.

## Calculer le coût réel d'une tasse

### Espresso
- Dose = 18 g de café
- Coût café = 18/1000 × prix €/kg torréfié

Exemple : café 28 €/kg → 0,504 € de café par espresso. PV TTC 2,20 € → reste à couvrir main-d'œuvre, loyer, marge.

### Cappuccino
Ajoutez 12–15 cl de lait. Si le lait monte, le cappuccino souffre **deux fois** (café + lait).

### Filtre batch
Coût grain souvent plus bas par tasse, mais gaspillage si surproduction. Suivez le **coût par tasse vendue**, pas par tasse brassée.

### Marge boisson chaude cible
Beaucoup d'établissements visent un coût matière boisson chaude **10–20 %** du PV HT selon le positionnement. Au-delà, la boisson ne finance plus la place assise.

## Stratégies d'achat

1. **Contrat trimestriel à prix cadré** avec clause de révision au-delà d'un corridor.
2. **Dual blend** : un espresso « maison » stable + un « origin » variable en prix.
3. **Volume groupé** multi-sites pour sécuriser un tarif.
4. **Stock tampon** 3–5 semaines si la DLUO et la fraîcheur torréfaction le permettent.
5. **Suivi ICE + alerte** pour anticiper l'appel du commercial.

Posez à votre torréfacteur : prix vert de référence, lag de répercussion (15, 30, 45 jours), politique si le marché retombe.

## Stratégies carte et salle

### Pricing en escalier
- Gardez le **café / espresso d'appel** le plus stable possible.
- Laissez les boissons signature, alternatives végétales et desserts caféés absorber la hausse.

### Architecture de menu boissons
- 3 tailles max.
- Supplément lait végétal explicite et revu avec le marché amande/avoine.
- Formules petit-déj : packager pour protéger le grain.

### Formation
Le serveur doit pouvoir dire : « Notre espresso est un 100 % arabica d'origine X, extrait à Y g » plutôt que s'excuser d'une hausse de 10 centimes.

### Qualité perçue
Une hausse acceptée finance parfois une **meilleure extraction** (machine entretenue, eau filtrée). Le client paie la tasse, pas le cours ICE.

## Indicateurs et alertes

Tableau de bord café CHR minimal :

| KPI | Fréquence |
|-----|-----------|
| Prix d'achat €/kg torréfié | Chaque facture |
| Cours arabica (signal) | Daily / alerte |
| Coût matière par tasse best-seller | Mensuel |
| % CA boissons chaudes | Hebdo |
| Ratio lait / café acheté | Mensuel |
| Impact € alerte HoReCa.Watch | À chaque seuil |

Sur [HoReCa.Watch](https://horeca.watch), couplez l'indicateur **café arabica** au profil de volumes pour recevoir une **alerte prix** avant la facture. Le brief du lundi peut empiler café + lait + électricité : vision complète du coût cappuccino.

## Erreurs fréquentes

1. Hausser tous les cafés d'un même pourcentage.
2. Ignorer le lait dans le coût cappuccino.
3. Changer de blend en silence (avis Google garantis).
4. Acheter « pas cher » un grain incompatible avec votre machine.
5. Aucun suivi entre deux renégo annuelles.
6. Promo « café à 1 € » pendant un spike de marché.
7. Oublier l'énergie de la machine à laver et du broyeur dans les analyses de rentabilité bar.

## FAQ

### Faut-il passer en 100 % robusta pour sauver la marge ?
Rarement en image de marque. Un ajustement de blend discret avec tests dégustation est préférable à un basculement brutal.

### Quelle fréquence de hausse carte café ?
Idéalement **2 fois par an max** sur les ancres, micro-mouvements plus fréquents sur signatures.

### Le café est-il un bon candidat à l'alerte GDELT ?
Oui : Brésil, Colombie, Vietnam, Éthiopie génèrent des signaux climatiques et logistiques exploitables en amont du prix.

### Comment parler de la hausse au client ?
Factuel et court : qualité, origine, engagement producteur. Évitez le discours plaintif sur « les marchés ».

## Conclusion

Le **prix café restaurant** en 2026 se pilote comme une mini-commodity desk : lire l'arabica, comprendre le blend, calculer la tasse complète (lait, énergie), alerter sur seuils, micro-pricer. [HoReCa.Watch](https://horeca.watch) vous donne le signal de marché et l'impact euro ; votre torréfacteur et votre carte font le reste. Objectif : une boisson chaude qui reste un centre de profit, pas une ligne de fuite du food & beverage cost.`,
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug)
}

export function getAllSlugs(): string[] {
  return blogPosts.map(p => p.slug)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
