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

  footer: {
    title: "Matchday",
    body: "Une seule adresse plutôt que six. Sans affiliation à un club, une ligue ou une fédération.",
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
  },

  notFound: {
    eyebrow: "404",
    title: "Club introuvable",
    body: "Ce hub couvre trois clubs pour l'instant.",
    back: "Retour à l'accueil",
  },

  nav: {
    label: "Sections du hub",
    squadStatus: "État de l'effectif",
    schedule: "Calendrier",
    contracts: "Contrats",
    availability: "Disponibilité",
    identity: "Identité",
  },

  hero: {
    meta: (stadium: string, capacity: string, founded: number) =>
      `${stadium} · ${capacity} places · fondé en ${founded}`,
    updated: "Mis à jour",
    home: "Tous les clubs",
  },

  squadStatus: {
    title: "État de l'effectif",
    /** "Prochain match : Stade Rennais (extérieur), dimanche 21 février" */
    nextFixture: (opponent: string, home: boolean, date: string) =>
      `Prochain match : ${opponent} (${home ? "domicile" : "extérieur"}), ${date}`,
    noFixture: "Aucun match programmé — l'effectif en l'état.",
    unavailable: "Indisponibles",
    doubtful: "Incertains",
    doubtfulNote: "décision au coup d'envoi, non comptés comme disponibles",
    atRisk: "À un carton",
    returning: "Retours attendus",
    ofSquad: (n: number) => `sur un effectif de ${n} joueurs`,
    certainNote: "suspensions et forfaits déclarés",
    noneUnavailable: "Personne n'est forfait pour le prochain match.",
    noneAtRisk: "Personne n'est à un carton d'une suspension.",
    cause: {
      suspension: "Suspendu",
      injury: "Blessé",
    },
    /** "Ligue 1 · encore 2 matchs" — « encore » évite tout accord de participe. */
    banDetail: (competition: string, matches: string) =>
      `${competition} · encore ${matches}`,
    lines: "Par poste",
    thin: "Dégarni",
    lineCount: (available: number, squad: number) =>
      `${available} sur ${squad} disponibles`,
    /**
     * Le contexte de charge, énoncé et non qualifié.
     *
     * Un badge « Lourde » précédait cette phrase : il reprenait l'adjectif sans
     * rien ajouter, et il qualifiait toute la série à partir d'un seul match
     * dense. La sévérité se calcule par match dans le Calendrier, pas ici. Ne
     * reste que le fait, formulé comme là-bas — des matchs, pas des semaines —
     * pour que le lecteur puisse le recompter d'un bloc à l'autre.
     */
    congestion: (heavy: number, total: number) =>
      `${heavy} des ${total} prochains matchs ${heavy < 2 ? "tombe" : "tombent"} dans une série de 3 en 8 jours — une absence y coûte davantage, la rotation absorbe moins.`,

    sources: {
      label: "Le détail",
      /** « 3 suspendus · 2 à un carton » */
      suspensionsCount: (suspended: number, atRisk: number) =>
        `${suspended} ${suspended < 2 ? "suspendu" : "suspendus"} · ${atRisk} à un carton`,
      /** « 5 dossiers · 2 forfaits » */
      injuriesCount: (total: number, out: number) =>
        `${total} ${total < 2 ? "dossier" : "dossiers"} · ${out} ${out < 2 ? "forfait" : "forfaits"}`,
      empty: "rien à signaler",
    },
  },

  suspensions: {
    title: "Suspensions et cartons",
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

  schedule: {
    title: "Calendrier",
    nextMatches: "Prochains matchs",
    across: "Sur",
    shortestRest: "Récupération la plus courte",
    travel: "Déplacements",
    /**
     * « 2 matchs dans une série de 3 en 8 jours ».
     *
     * Compte des matchs, pas des semaines : la fenêtre est glissante, et
     * « semaine chargée » ferait croire à un découpage calendaire.
     */
    heavyFixtures: (n: number) =>
      `${n} ${n < 2 ? "match" : "matchs"} dans une série de 3 en 8 jours`,
    severity: {
      normal: "Normale",
      tight: "Serrée",
      heavy: "Lourde",
    },

    /**
     * La phrase de charge, qui remplace trois colonnes de chiffres nus.
     *
     * « repos » reste invariable ici : on compte les jours, pas les repos.
     */
    load: {
      /** « 3 jours de repos · 2 matchs sur 8 » */
      detail: (rest: string, density: number) =>
        `${rest} de repos · ${density} ${density < 2 ? "match" : "matchs"} sur 8`,
      /** « 2 matchs sur 8 jours » — première ligne, sans repos mesurable. */
      densityOnly: (density: number) =>
        `${density} ${density < 2 ? "match" : "matchs"} sur 8 jours`,
    },

    table: {
      date: "Date",
      fixture: "Match",
      competition: "Compét.",
      load: "Charge",
      travel: "Trajet",
    },
    home: "Domicile",
    away: "Extérieur",
    /** Formes abrégées, pour les listes sans place pour un mot entier. */
    homeShort: "D",
    awayShort: "E",
    kickoffNote: "Heures de coup d'envoi en UTC.",

    recent: {
      title: "Résultats récents",
      /**
       * « 6 joués · 4V 1N 1D ».
       *
       * Victoire / Nul / Défaite : les initiales françaises, pas W/D/L.
       */
      count: (played: number, w: number, d: number, l: number) =>
        `${played} ${played < 2 ? "joué" : "joués"} · ${w}V ${d}N ${l}D`,
      empty: "Aucun match joué",
    },
  },

  contracts: {
    title: "Fins de contrat",
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
  },

  injuries: {
    title: "Infirmerie",
    stage: {
      out: "Forfait",
      doubtful: "Incertain",
      returning: "En reprise",
      resolved: "De nouveau disponible",
    },
    counts: {
      out: "Forfaits",
      doubtful: "Incertains",
      returning: "En reprise",
      conflicts: "Sources contradictoires",
    },
    none: "Aucun joueur de l'effectif n'est annoncé blessé.",
    area: {
      ankle: "Cheville",
      calf: "Mollet",
      hamstring: "Ischio-jambiers",
      knee: "Genou",
      thigh: "Cuisse",
      groin: "Adducteurs",
      foot: "Pied",
      shoulder: "Épaule",
      back: "Dos",
      head: "Tête",
      illness: "Maladie",
      other: "Non précisé",
    },
    sinceLabel: "Absent depuis",
    daysOut: (days: string) => `${days} d'absence`,
    expectedLabel: "Retour attendu",
    noReturnDate: "Aucune date de retour",
    noReturnDetail:
      "Aucune source n'avance de date. Le hub n'en invente pas — une absence sans horizon est signalée comme telle.",
    missesLabel: "Devrait manquer",
    missesCount: (n: number) => (n === 1 ? "1 match à venir" : `${n} matchs à venir`),
    missesNone: "Aucun match avant le retour attendu",
    fixturesLabel: "Matchs avant cette date",
    backForNext: (opponent: string) => `Retour attendu pour ${opponent}`,
    conflictLabel: "Ce sur quoi les sources divergent",
    rationaleLabel: "Pourquoi cette estimation",
  },

  identity: {
    title: "Identité du club",
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
      "Club medical update": "Point médical du club",
      "Press report": "Article de presse",
      "Recovery norms": "Délais de guérison types",
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
    /**
     * Prose carried inside the injury records: the reasoning behind an
     * estimate, and the wording of a source conflict. Unlike a label, these
     * are whole sentences — they live here for the same reason the rest of
     * this table does, so a French page does not fall back to English while
     * the aggregator still emits one locale.
     */
    injuryProse: {
      "The club said 'several weeks' without a date; two outlets reported a return for the Monaco fixture on 6 March. A grade-two hamstring in a 29-year-old averages 32 days, which lands a week later — the later date is used, because early returns on this injury are what cause the re-injury.":
        "Le club a annoncé « plusieurs semaines » sans donner de date ; deux médias annoncent un retour pour le match contre Monaco le 6 mars. Une lésion des ischio-jambiers de grade 2 chez un joueur de 29 ans demande 32 jours en moyenne, soit une semaine plus tard — c'est la date la plus tardive qui est retenue, car sur cette blessure ce sont les retours précipités qui provoquent la rechute.",
      "Four fixtures fall before the estimated return, including a cup tie the club may have rested him for regardless.":
        "Quatre matchs tombent avant le retour estimé, dont un match de coupe pour lequel le club l'aurait peut-être ménagé de toute façon.",
      "The club has not given a date; two press reports name 6 March, a week earlier than the recovery norm for this injury.":
        "Le club n'a pas donné de date ; deux articles de presse avancent le 6 mars, soit une semaine avant le délai de guérison type pour cette blessure.",
      "Returned to part-training on 19 February. The staff described him as available if he comes through the final session — a matchday call, not a fixed date.":
        "Retour à l'entraînement partiel le 19 février. Le staff l'annonce disponible s'il passe la dernière séance — une décision de veille de match, pas une date arrêtée.",
      "Expected to miss the immediate fixture only, assuming the final session is cleared.":
        "Ne devrait manquer que le match immédiat, sous réserve que la dernière séance se passe bien.",
      "Full training since 17 February. The club expects a place on the bench for the next fixture rather than a start.":
        "Entraînement complet depuis le 17 février. Le club l'envisage sur le banc pour le prochain match plutôt que titulaire.",
      "Expected back for the Monaco fixture on 25 February, so the Rennes match on 21 February is the last he misses.":
        "Retour attendu pour le match contre Monaco le 25 février : celui contre Rennes le 21 février est donc le dernier qu'il manque.",
      "No source will commit to a return date. The club has said only that he is 'continuing his rehabilitation' — repeated verbatim in three updates since 18 January.":
        "Aucune source n'avance de date de retour. Le club se borne à indiquer qu'il « poursuit sa rééducation » — formule reprise mot pour mot dans trois communiqués depuis le 18 janvier.",
      "No club statement. Withdrawn at half-time on 11 February and absent from the two team sheets since; a calf strain of that pattern averages three weeks.":
        "Aucun communiqué du club. Sorti à la mi-temps le 11 février et absent des deux feuilles de match suivantes ; une lésion au mollet de ce type demande trois semaines en moyenne.",
      "Three fixtures fall before the estimated return.":
        "Trois matchs tombent avant le retour estimé.",
      "The injury itself is inferred from two consecutive team-sheet absences, not announced. The club has not confirmed it.":
        "La blessure elle-même est déduite de deux absences consécutives sur la feuille de match, et non annoncée. Le club ne l'a pas confirmée.",
      "Missed two sessions with a virus. Named as a probable starter if he trains on the eve of the match.":
        "A manqué deux séances pour un virus. Annoncé titulaire probable s'il s'entraîne la veille du match.",
      "Expected to be available, though an illness this close to kick-off can rule a player out on the day.":
        "Devrait être disponible, même si une maladie si près du coup d'envoi peut écarter un joueur le jour même.",
      "Returned to the matchday squad on 14 February and played 62 minutes on 18 February.":
        "Réintégré au groupe le 14 février, il a joué 62 minutes le 18 février.",
      "Available and already featuring.":
        "Disponible et déjà utilisé.",
      "The club announced 'around six weeks' on 5 February, which would be mid-March. His two previous hamstring injuries each ran a fortnight past the announced date, so the estimate is pushed to the later end.":
        "Le club a annoncé « environ six semaines » le 5 février, soit la mi-mars. Ses deux précédentes blessures aux ischio-jambiers ont chacune dépassé de quinze jours la date annoncée : l'estimation est donc repoussée vers la fourchette haute.",
      "Six fixtures fall before the adjusted return date; the club's own six-week estimate would spare him the last of them.":
        "Six matchs tombent avant la date de retour ajustée ; l'estimation à six semaines du club lui épargnerait le dernier d'entre eux.",
      "The club's six-week estimate puts him back on 18 March. His own injury history suggests later, and the two cannot both be right.":
        "L'estimation à six semaines du club le ramène au 18 mars. Son historique de blessures suggère plus tard, et les deux ne peuvent pas être vrais en même temps.",
      "A dislocation reduced on the pitch. The club ruled out surgery on 17 February and named a two-week horizon, which press reports have repeated without adding a source of their own.":
        "Une luxation réduite sur le terrain. Le club a écarté l'opération le 17 février et évoqué un horizon de deux semaines, repris tel quel par la presse sans source propre.",
      "Two fixtures fall before the reported return.":
        "Deux matchs tombent avant le retour annoncé.",
      "Back in full training since 16 February with no reaction reported. Expected to be in the squad, likely from the bench.":
        "Retour à l'entraînement complet depuis le 16 février, sans réaction signalée. Attendu dans le groupe, probablement sur le banc.",
      "Available for selection.":
        "Disponible pour la sélection.",
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
