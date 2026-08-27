/**
 * French dictionary.
 *
 * Typed as `Dictionary`, so it is checked key-for-key against English at
 * compile time. Note the plural boundaries: French treats 0 as singular
 * ("0 jour", "1 jour", "2 jours"), which is why `units` cannot be shared.
 */

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

export const fr: Dictionary = {
  locale: "fr" as Locale,

  meta: {
    siteName: "Matchday",
    titleTemplate: "%s · Matchday",
    description:
      "Le hub du club : suspensions, calendrier chargé et fins de contrat à une seule adresse plutôt que six.",
    clubDescription: (club: string) =>
      `${club} : suspensions, cumul de cartons, densité du calendrier et fins de contrat au même endroit.`,
    clubNotFound: "Club introuvable",
  },

  banner: {
    tag: "Données de démonstration",
    body: "Les matchs, cartons et contrats de ce site sont inventés pour un prototype de conception. Rien ici ne reflète de vrais clubs ni de vrais joueurs.",
  },

  footer: {
    title: "Matchday — prototype de hub de club.",
    body: "Une seule adresse plutôt que six. Cette version livre la couche calculable — suspensions, densité du calendrier, fins de contrat et historique de disponibilité — ainsi que l'identité du club. Sans affiliation à un club, une ligue ou une fédération.",
    demo: "Tous les chiffres sont des données de démonstration.",
    computed: "Les blocs calculables sont calculés, jamais stockés.",
  },

  localeSwitcher: {
    label: "Langue",
  },

  home: {
    tagline: {
      claim: "Une seule adresse plutôt que six.",
      rest: "Qui est suspendu, qui est à un carton de l'être, à quel point la quinzaine à venir est chargée, et quels contrats expirent en juin — calculé à partir de sources publiques, pas collecté à la main.",
    },
    clubs: "Clubs",
    suspended: "Suspendus",
    atRisk: "À un carton",
    outOfContract: "En fin de contrat",
    note: {
      lead: "Pourquoi ces blocs.",
      body: "Les suspensions, la densité du calendrier et les fins de contrat se déduisent de faits publics : leur mise à jour ne coûte rien et personne ne peut les devancer. L'infirmerie est ce qui fait venir les visiteurs, mais elle relève du jugement sur des sources contradictoires — elle n'est pas livrée ici, car une page qui énonce une supposition sur le ton du fait établi vaut moins qu'une page qui se tait.",
    },
  },

  notFound: {
    eyebrow: "404",
    title: "Club introuvable",
    body: "Ce hub couvre trois clubs pour l'instant.",
    back: "Retour à l'accueil",
  },

  nav: {
    label: "Sections du hub",
    suspensions: "Suspensions",
    congestion: "Calendrier",
    contracts: "Contrats",
    availability: "Disponibilité",
    identity: "Identité",
    fixtures: "Matchs",
  },

  hero: {
    meta: (stadium: string, capacity: string, founded: number) =>
      `${stadium} · ${capacity} places · fondé en ${founded}`,
    updated: "Mis à jour",
    suspended: "Suspendus",
    forFixture: (opponent: string, home: boolean) =>
      home ? `contre ${opponent}` : `pour le déplacement à ${opponent}`,
    noFixture: "aucun match programmé",
    atRisk: "À un carton",
    atRiskNote: "d'une suspension pour cumul",
    nextSix: "6 prochains matchs",
    congestionNote: (heavyWeeks: string, travel: string) =>
      `${heavyWeeks}, ${travel} km`,
    outOfContract: "En fin de contrat",
    contractNote: (matches: string, n: number) =>
      `en juin · ${matches} ${n < 2 ? "manqué" : "manqués"} sur suspension`,
  },

  suspensions: {
    title: "Suspensions et cartons",
    lede: "Calculé à partir des rapports de match publics selon le règlement propre à chaque compétition. Aucun jugement, aucune collecte — les mêmes données donnent toujours le même résultat.",
    out: "Absents sur suspension",
    noneServing: "Personne ne purge de suspension actuellement.",
    reason: {
      threshold: "Cumul de cartons",
      red: "Carton rouge direct",
      "second-yellow": "Deux avertissements",
    },
    suspendedFallback: "Suspendu",
    misses: (fixtures: string) => `Manque ${fixtures}`,
    versus: "contre",
    at: "à",
    oneCardAway: "À un carton de la suspension",
    noneOnThreshold: "Personne n'est à la limite.",
    yellowsOf: (held: number, threshold: number) =>
      `${held} avertissements sur ${threshold}`,
    atRiskPill: "En sursis",
    squadDiscipline: "Discipline de l'effectif",
    yellowCards: "Cartons jaunes",
    dismissals: "Expulsions",
    cardsPerMatch: "Cartons par match",
    onThreshold: "À la limite",
    carrying: "Cartons en cours",
  },

  congestion: {
    title: "Densité du calendrier",
    lede: "Ce que la prochaine série de matchs coûte réellement : le temps de récupération entre les rencontres, les matchs sur huit jours glissants et les kilomètres parcourus.",
    nextMatches: "Prochains matchs",
    across: "Sur",
    shortestRest: "Récupération la plus courte",
    travel: "Déplacements",
    severity: {
      normal: "Normale",
      tight: "Serrée",
      heavy: "Lourde",
    },
    table: {
      date: "Date",
      fixture: "Match",
      rest: "Repos",
      inEightDays: "Sur 8 jours",
      travel: "Trajet",
      load: "Charge",
    },
    home: "D",
    away: "E",
  },

  contracts: {
    title: "Fins de contrat",
    lede: (seasonEnd: string) =>
      `Qui arrive en fin de contrat le ${seasonEnd}, qui entame sa dernière année et qui est sous contrat. Des dates uniquement — une date inconnue est affichée comme inconnue, jamais estimée.`,
    expiringCount: "En fin de contrat en juin",
    finalYearCount: "Dans leur dernière année",
    unknownCount: "Date inconnue",
    status: {
      expiring: "Expire",
      "final-year": "Dernière année",
      secure: "Sous contrat",
      unknown: "Inconnu",
    },
    table: {
      status: "Statut",
      player: "Joueur",
      position: "Poste",
      age: "Âge",
      contractTo: "Contrat jusqu'au",
      remaining: "Restant",
    },
    loan: "Prêt",
    notKnown: "Inconnue",
  },

  availability: {
    title: "Historique de disponibilité",
    lede: "Les matchs manqués depuis le début de la saison et pourquoi. Établi à partir des feuilles de match déjà publiées — c'est un historique, pas une prévision de retour.",
    byPlayer: "Matchs manqués par joueur",
    noneMissed: "Personne n'a manqué de match cette saison.",
    reason: {
      suspension: "Suspension",
      injury: "Blessure",
      international: "Sélection nationale",
      other: "Autre",
    },
    reasonInline: {
      suspension: "suspension",
      injury: "blessure",
      international: "sélection nationale",
      other: "autre",
    },
    seasonTotal: "Total de la saison",
    totalSentence: {
      middle: " matchs-joueurs perdus, dont ",
      after: " sur suspension.",
    },
    note: "Le temps perdu sur suspension est la part évitable — et la seule que ce hub peut anticiper, car une suspension suit une règle alors qu'une guérison n'en suit aucune.",
  },

  identity: {
    title: "Identité du club",
    lede: "Palmarès, records et effectif actuel. Un socle stable plutôt qu'une raison de revenir — ce sont les blocs ci-dessus qui jouent ce rôle.",
    honours: "Palmarès",
    records: "Records",
    squad: (count: number) => `Effectif (${count})`,
    position: {
      GK: "Gardiens",
      DF: "Défenseurs",
      MF: "Milieux",
      FW: "Attaquants",
    },
  },

  fixtures: {
    title: "Matchs",
    lede: "Le calendrier sur lequel les blocs ci-dessus sont calculés.",
    nextUp: "À venir",
    recent: "Résultats récents",
    kickoffNote: "Heures de coup d'envoi en UTC.",
    home: "D",
    away: "E",
  },

  provenance: {
    confidence: {
      official: "Officiel",
      reported: "Rapporté",
      derived: "Déduit",
      estimated: "Estimé",
    },
  },

  units: {
    // French: 0 and 1 are both singular.
    days: (n: number) => `${n} ${n < 2 ? "jour" : "jours"}`,
    matches: (n: number) => `${n} ${n < 2 ? "match" : "matchs"}`,
    daysShort: (n: number) => `${n} j`,
    weeks: (n: number) =>
      `${n} ${n < 2 ? "semaine chargée" : "semaines chargées"}`,
    months: (n: number) => `${n} mois`,
    years: (n: number) => `${n} ${n < 2 ? "an" : "ans"}`,
    yearsMonths: (y: number, m: number) =>
      `${y} ${y < 2 ? "an" : "ans"} ${m} mois`,
    contractUnknown: "Inconnu",
    contractExpired: "Expiré",
    // 1er, 2e, 3e…
    ordinal: (n: number) => (n === 1 ? "1er" : `${n}e`),
  },

  data: {
    recordLabel: {
      "Record league win": "Plus large victoire en championnat",
      "Most appearances": "Plus grand nombre de matchs",
      "Record attendance": "Record d'affluence",
      "Top scorer": "Meilleur buteur",
      "Consecutive titles": "Titres consécutifs",
    },
    sourceLabel: {
      "Club archive": "Archives du club",
      "Club team sheet": "Feuille de match du club",
      "LFP disciplinary committee": "Commission de discipline de la LFP",
      "LFP match report": "Rapport de match de la LFP",
    },
    absenceNote: {
      AFCON: "CAN",
      Ankle: "Cheville",
      Calf: "Mollet",
      Hamstring: "Ischio-jambiers",
      Knee: "Genou",
      Knock: "Coup reçu",
      Thigh: "Cuisse",
    },
    nationality: {
      Algeria: "Algérie",
      Angola: "Angola",
      Argentina: "Argentine",
      Belgium: "Belgique",
      Brazil: "Brésil",
      Cameroon: "Cameroun",
      Canada: "Canada",
      "Central African Republic": "République centrafricaine",
      Denmark: "Danemark",
      Ecuador: "Équateur",
      England: "Angleterre",
      France: "France",
      Georgia: "Géorgie",
      Morocco: "Maroc",
      Panama: "Panama",
      Portugal: "Portugal",
      Russia: "Russie",
      Senegal: "Sénégal",
      Serbia: "Serbie",
      Spain: "Espagne",
      Switzerland: "Suisse",
      "United States": "États-Unis",
    },
  },
};
