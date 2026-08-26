/**
 * Seed generator.
 *
 * The data is invented, but it must be *coherent*: an absence row for a
 * suspension has to correspond to a card that actually triggers a ban, and a
 * fixture referenced by a card has to exist. Generating it beats hand-writing
 * three JSON files that quietly disagree with each other.
 */
import { writeFileSync, mkdirSync } from "node:fs";

const LIGUE1 = "Ligue 1";
const UCL = "UEFA Champions League";
const CDF = "Coupe de France";

const RULES = [
  { competition: LIGUE1, yellowThreshold: 5, yellowBanMatches: 1, redBanMatches: 2, secondYellowBanMatches: 1 },
  { competition: UCL, yellowThreshold: 3, yellowBanMatches: 1, redBanMatches: 2, secondYellowBanMatches: 1 },
  { competition: CDF, yellowThreshold: 3, yellowBanMatches: 1, redBanMatches: 2, secondYellowBanMatches: 1 },
];

const src = (label, observedAt, url) => (url ? { label, observedAt, url } : { label, observedAt });

/** Deterministic PRNG so re-running the seed does not churn the dataset. */
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function buildFixtures(rand, opponents) {
  const fixtures = [];
  // Season runs Aug -> May; "today" for the demo sits in late February.
  let date = new Date("2026-08-15T19:00:00Z");
  let i = 0;
  while (fixtures.length < 46) {
    const opp = opponents[i % opponents.length];
    const venue = i % 2 === 0 ? "home" : "away";
    const comp = i % 7 === 6 ? UCL : i % 11 === 10 ? CDF : LIGUE1;
    const kickoff = new Date(date);

    fixtures.push({
      id: `f${String(i + 1).padStart(2, "0")}`,
      kickoff: kickoff.toISOString(),
      competition: comp,
      opponent: opp.name,
      opponentShort: opp.short,
      venue,
      travelKm: venue === "away" ? opp.km : 0,
    });

    // Alternate 7/4/3-day gaps so congestion has something real to detect.
    const gap = i % 5 === 4 ? 3 : i % 3 === 2 ? 4 : 7;
    date = new Date(date.getTime() + gap * 86400000);
    i += 1;
  }
  return fixtures;
}

function play(fixtures, now, rand) {
  for (const f of fixtures) {
    if (new Date(f.kickoff) < now) {
      const gf = Math.floor(rand() * 4);
      const ga = Math.floor(rand() * 3);
      f.result = { goalsFor: gf, goalsAgainst: ga };
    }
  }
}

const NOW = new Date("2027-02-20T12:00:00Z");

function buildClub(cfg) {
  const rand = rng(cfg.seed);
  const fixtures = buildFixtures(rand, cfg.opponents);
  play(fixtures, NOW, rand);

  const played = fixtures.filter((f) => f.result);
  const cards = [];
  const absences = [];

  // Card distribution: a handful of players carry most of the discipline load,
  // which is what makes a "one card from a ban" list worth publishing.
  for (const [idx, plan] of cfg.cardPlan.entries()) {
    const player = cfg.squad.find((p) => p.playerSlug === plan.slug);
    if (!player) throw new Error(`unknown player ${plan.slug}`);

    const pool = played.filter((f) => f.competition === (plan.competition ?? LIGUE1));

    /**
     * `recent: true` clusters the yellows into the closing fixtures so the
     * threshold is crossed just before "today" and the ban is still being
     * served. Without it every accumulation ban is served months earlier and
     * the suspension block renders empty — technically correct, useless as a
     * demonstration.
     */
    const window = plan.recent ? pool.slice(-plan.yellows) : pool;

    for (let n = 0; n < plan.yellows; n += 1) {
      const f = plan.recent
        ? window[n % window.length]
        : pool[Math.floor((n + idx) * 2.3) % pool.length];
      cards.push({
        playerSlug: plan.slug,
        fixtureId: f.id,
        date: f.kickoff.slice(0, 10),
        competition: f.competition,
        type: "yellow",
        minute: 20 + Math.floor(rand() * 65),
        source: src("LFP match report", f.kickoff.slice(0, 10)),
      });
    }

    if (plan.red) {
      // Place the dismissal in one of the last two played fixtures so the ban
      // is still being served at "today" — otherwise the block reads empty.
      const f = pool[pool.length - (plan.redRecency ?? 1)];
      cards.push({
        playerSlug: plan.slug,
        fixtureId: f.id,
        date: f.kickoff.slice(0, 10),
        competition: f.competition,
        type: plan.red,
        minute: 55 + Math.floor(rand() * 35),
        source: src("LFP disciplinary committee", f.kickoff.slice(0, 10)),
      });
    }
  }

  for (const plan of cfg.absencePlan) {
    const pool = played.slice(-plan.count - (plan.offset ?? 0));
    for (const f of pool.slice(0, plan.count)) {
      absences.push({
        playerSlug: plan.slug,
        fixtureId: f.id,
        date: f.kickoff.slice(0, 10),
        reason: plan.reason,
        ...(plan.note ? { note: plan.note } : {}),
        source: src(plan.reason === "suspension" ? "LFP disciplinary committee" : "Club team sheet", f.kickoff.slice(0, 10)),
      });
    }
  }

  return {
    identity: cfg.identity,
    honours: cfg.honours,
    records: cfg.records,
    squad: cfg.squad,
    fixtures,
    cards,
    absences,
    rules: RULES,
    updatedAt: "2027-02-20T09:00:00Z",
  };
}

const OPPONENTS_A = [
  { name: "Olympique de Marseille", short: "OM", km: 660 },
  { name: "Olympique Lyonnais", short: "OL", km: 395 },
  { name: "LOSC Lille", short: "LIL", km: 205 },
  { name: "Stade Rennais", short: "REN", km: 310 },
  { name: "AS Monaco", short: "MON", km: 690 },
  { name: "OGC Nice", short: "NIC", km: 685 },
  { name: "RC Lens", short: "LEN", km: 180 },
];

function opponentsFor(exclude, extra) {
  return [...OPPONENTS_A.filter((o) => o.short !== exclude), ...extra];
}

mkdirSync("data/clubs", { recursive: true });

/* ------------------------------------------------------------------ PSG */
const psg = buildClub({
  seed: 7,
  identity: {
    slug: "paris-saint-germain",
    name: "Paris Saint-Germain",
    shortName: "PSG",
    founded: 1970,
    stadium: "Parc des Princes",
    stadiumCapacity: 47929,
    city: "Paris",
    competition: LIGUE1,
    colors: { primary: "#004170", secondary: "#DA291C" },
  },
  honours: [
    { label: "Ligue 1", count: 12, years: [2026, 2024, 2023, 2022, 2020, 2019], tier: "domestic" },
    { label: "Coupe de France", count: 15, years: [2026, 2024, 2021, 2020], tier: "cup" },
    { label: "UEFA Champions League", count: 1, years: [2025], tier: "continental" },
    { label: "Trophée des Champions", count: 12, years: [2025, 2024, 2023], tier: "other" },
  ],
  records: [
    { label: "Record league win", value: "9–0", detail: "v Troyes, August 2021", source: src("Club archive", "2026-08-01") },
    { label: "Most appearances", value: "470", detail: "Marquinhos", source: src("Club archive", "2026-08-01") },
    { label: "Top scorer", value: "256 goals", detail: "Kylian Mbappé", source: src("Club archive", "2026-08-01") },
    { label: "Record attendance", value: "49,575", detail: "v Waterschei, 1983", source: src("Club archive", "2026-08-01") },
  ],
  squad: [
    { playerSlug: "lucas-chevalier", playerName: "Lucas Chevalier", position: "GK", shirtNumber: 30, from: "2025-07-01", until: null, contractUntil: "2030-06-30", onLoan: false, birthDate: "2001-11-06", nationality: "France" },
    { playerSlug: "marquinhos", playerName: "Marquinhos", position: "DF", shirtNumber: 5, from: "2013-07-01", until: null, contractUntil: "2028-06-30", onLoan: false, birthDate: "1994-05-14", nationality: "Brazil" },
    { playerSlug: "willian-pacho", playerName: "Willian Pacho", position: "DF", shirtNumber: 51, from: "2024-07-01", until: null, contractUntil: "2029-06-30", onLoan: false, birthDate: "2001-10-16", nationality: "Ecuador" },
    { playerSlug: "nuno-mendes", playerName: "Nuno Mendes", position: "DF", shirtNumber: 25, from: "2021-08-01", until: null, contractUntil: "2029-06-30", onLoan: false, birthDate: "2002-06-19", nationality: "Portugal" },
    { playerSlug: "achraf-hakimi", playerName: "Achraf Hakimi", position: "DF", shirtNumber: 2, from: "2021-07-06", until: null, contractUntil: "2027-06-30", onLoan: false, birthDate: "1998-11-04", nationality: "Morocco" },
    { playerSlug: "lucas-hernandez", playerName: "Lucas Hernández", position: "DF", shirtNumber: 21, from: "2023-07-01", until: null, contractUntil: "2027-06-30", onLoan: false, birthDate: "1996-02-14", nationality: "France" },
    { playerSlug: "vitinha", playerName: "Vitinha", position: "MF", shirtNumber: 17, from: "2022-07-01", until: null, contractUntil: "2029-06-30", onLoan: false, birthDate: "2000-02-13", nationality: "Portugal" },
    { playerSlug: "joao-neves", playerName: "João Neves", position: "MF", shirtNumber: 87, from: "2024-08-01", until: null, contractUntil: "2029-06-30", onLoan: false, birthDate: "2004-09-27", nationality: "Portugal" },
    { playerSlug: "fabian-ruiz", playerName: "Fabián Ruiz", position: "MF", shirtNumber: 8, from: "2022-08-01", until: null, contractUntil: "2027-06-30", onLoan: false, birthDate: "1996-04-03", nationality: "Spain" },
    { playerSlug: "warren-zaire-emery", playerName: "Warren Zaïre-Emery", position: "MF", shirtNumber: 33, from: "2022-08-01", until: null, contractUntil: "2029-06-30", onLoan: false, birthDate: "2006-03-08", nationality: "France" },
    { playerSlug: "ousmane-dembele", playerName: "Ousmane Dembélé", position: "FW", shirtNumber: 10, from: "2023-08-15", until: null, contractUntil: "2028-06-30", onLoan: false, birthDate: "1997-05-15", nationality: "France" },
    { playerSlug: "bradley-barcola", playerName: "Bradley Barcola", position: "FW", shirtNumber: 29, from: "2023-09-01", until: null, contractUntil: "2028-06-30", onLoan: false, birthDate: "2002-09-02", nationality: "France" },
    { playerSlug: "desire-doue", playerName: "Désiré Doué", position: "FW", shirtNumber: 14, from: "2024-08-01", until: null, contractUntil: "2029-06-30", onLoan: false, birthDate: "2005-06-03", nationality: "France" },
    { playerSlug: "goncalo-ramos", playerName: "Gonçalo Ramos", position: "FW", shirtNumber: 9, from: "2023-09-01", until: null, contractUntil: "2028-06-30", onLoan: false, birthDate: "2001-06-20", nationality: "Portugal" },
    { playerSlug: "senny-mayulu", playerName: "Senny Mayulu", position: "MF", shirtNumber: 24, from: "2024-01-01", until: null, contractUntil: null, onLoan: false, birthDate: "2006-04-02", nationality: "France" },
    { playerSlug: "matvey-safonov", playerName: "Matvey Safonov", position: "GK", shirtNumber: 39, from: "2024-07-01", until: null, contractUntil: "2027-06-30", onLoan: false, birthDate: "1999-02-25", nationality: "Russia" },
  ],
  cardPlan: [
    { slug: "joao-neves", yellows: 4 },
    { slug: "vitinha", yellows: 4 },
    { slug: "lucas-hernandez", yellows: 5, recent: true },
    { slug: "marquinhos", yellows: 3 },
    { slug: "achraf-hakimi", yellows: 2, red: "red", redRecency: 1 },
    { slug: "fabian-ruiz", yellows: 2 },
    { slug: "ousmane-dembele", yellows: 1 },
    { slug: "warren-zaire-emery", yellows: 2, competition: UCL },
  ],
  absencePlan: [
    { slug: "lucas-hernandez", reason: "suspension", count: 1 },
    { slug: "goncalo-ramos", reason: "injury", count: 4, note: "Ankle" },
    { slug: "marquinhos", reason: "injury", count: 2, note: "Thigh" },
    { slug: "senny-mayulu", reason: "other", count: 1 },
  ],
  opponents: opponentsFor("PSG", [{ name: "Paris FC", short: "PFC", km: 8 }]),
});

/* ------------------------------------------------------------------- OM */
const om = buildClub({
  seed: 19,
  identity: {
    slug: "olympique-de-marseille",
    name: "Olympique de Marseille",
    shortName: "OM",
    founded: 1899,
    stadium: "Orange Vélodrome",
    stadiumCapacity: 67394,
    city: "Marseille",
    competition: LIGUE1,
    colors: { primary: "#2FAEE0", secondary: "#FFFFFF" },
  },
  honours: [
    { label: "Ligue 1", count: 9, years: [2010, 1992, 1991, 1990], tier: "domestic" },
    { label: "Coupe de France", count: 10, years: [1989, 1976, 1972], tier: "cup" },
    { label: "UEFA Champions League", count: 1, years: [1993], tier: "continental" },
    { label: "Coupe de la Ligue", count: 3, years: [2012, 2011, 2010], tier: "other" },
  ],
  records: [
    { label: "Record league win", value: "8–0", detail: "v Sochaux, 1942", source: src("Club archive", "2026-08-01") },
    { label: "Most appearances", value: "618", detail: "Roger Scotti", source: src("Club archive", "2026-08-01") },
    { label: "Top scorer", value: "182 goals", detail: "Gunnar Andersson", source: src("Club archive", "2026-08-01") },
    { label: "Record attendance", value: "65,894", detail: "v PSG, 2016", source: src("Club archive", "2026-08-01") },
  ],
  squad: [
    { playerSlug: "geronimo-rulli", playerName: "Gerónimo Rulli", position: "GK", shirtNumber: 1, from: "2024-08-01", until: null, contractUntil: "2027-06-30", onLoan: false, birthDate: "1992-05-20", nationality: "Argentina" },
    { playerSlug: "leonardo-balerdi", playerName: "Leonardo Balerdi", position: "DF", shirtNumber: 5, from: "2020-08-01", until: null, contractUntil: "2028-06-30", onLoan: false, birthDate: "1999-01-26", nationality: "Argentina" },
    { playerSlug: "derek-cornelius", playerName: "Derek Cornelius", position: "DF", shirtNumber: 24, from: "2024-08-01", until: null, contractUntil: "2028-06-30", onLoan: false, birthDate: "1997-11-25", nationality: "Canada" },
    { playerSlug: "amir-murillo", playerName: "Amir Murillo", position: "DF", shirtNumber: 3, from: "2024-07-01", until: null, contractUntil: "2027-06-30", onLoan: false, birthDate: "1996-02-11", nationality: "Panama" },
    { playerSlug: "quentin-merlin", playerName: "Quentin Merlin", position: "DF", shirtNumber: 27, from: "2024-01-31", until: null, contractUntil: "2028-06-30", onLoan: false, birthDate: "2002-05-16", nationality: "France" },
    { playerSlug: "pierre-emile-hojbjerg", playerName: "Pierre-Emile Højbjerg", position: "MF", shirtNumber: 23, from: "2024-08-30", until: null, contractUntil: "2029-06-30", onLoan: false, birthDate: "1995-08-05", nationality: "Denmark" },
    { playerSlug: "geoffrey-kondogbia", playerName: "Geoffrey Kondogbia", position: "MF", shirtNumber: 44, from: "2024-08-01", until: null, contractUntil: "2027-06-30", onLoan: false, birthDate: "1993-02-15", nationality: "Central African Republic" },
    { playerSlug: "adrien-rabiot", playerName: "Adrien Rabiot", position: "MF", shirtNumber: 25, from: "2025-09-01", until: null, contractUntil: "2028-06-30", onLoan: false, birthDate: "1995-04-03", nationality: "France" },
    { playerSlug: "bilal-nadir", playerName: "Bilal Nadir", position: "MF", shirtNumber: 29, from: "2023-01-01", until: null, contractUntil: null, onLoan: false, birthDate: "2003-12-25", nationality: "Morocco" },
    { playerSlug: "mason-greenwood", playerName: "Mason Greenwood", position: "FW", shirtNumber: 10, from: "2024-07-01", until: null, contractUntil: "2029-06-30", onLoan: false, birthDate: "2001-10-01", nationality: "England" },
    { playerSlug: "amine-gouiri", playerName: "Amine Gouiri", position: "FW", shirtNumber: 11, from: "2025-01-31", until: null, contractUntil: "2029-06-30", onLoan: false, birthDate: "2000-02-16", nationality: "Algeria" },
    { playerSlug: "jonathan-rowe", playerName: "Jonathan Rowe", position: "FW", shirtNumber: 20, from: "2024-08-01", until: null, contractUntil: "2027-06-30", onLoan: true, birthDate: "2003-07-18", nationality: "England" },
    { playerSlug: "faris-moumbagna", playerName: "Faris Moumbagna", position: "FW", shirtNumber: 9, from: "2024-01-01", until: null, contractUntil: "2027-06-30", onLoan: false, birthDate: "2000-06-27", nationality: "Cameroon" },
    { playerSlug: "ulisses-garcia", playerName: "Ulisses Garcia", position: "DF", shirtNumber: 21, from: "2024-08-01", until: null, contractUntil: "2027-06-30", onLoan: false, birthDate: "1996-01-11", nationality: "Switzerland" },
  ],
  cardPlan: [
    { slug: "leonardo-balerdi", yellows: 5, recent: true },
    { slug: "geoffrey-kondogbia", yellows: 4 },
    { slug: "pierre-emile-hojbjerg", yellows: 4 },
    { slug: "adrien-rabiot", yellows: 3 },
    { slug: "amir-murillo", yellows: 2, red: "second-yellow", redRecency: 2 },
    { slug: "mason-greenwood", yellows: 2 },
    { slug: "quentin-merlin", yellows: 1 },
  ],
  absencePlan: [
    { slug: "amir-murillo", reason: "suspension", count: 1 },
    { slug: "faris-moumbagna", reason: "injury", count: 6, note: "Knee" },
    { slug: "jonathan-rowe", reason: "injury", count: 2, note: "Hamstring" },
    { slug: "bilal-nadir", reason: "international", count: 3, note: "AFCON" },
  ],
  opponents: opponentsFor("OM", [{ name: "Paris Saint-Germain", short: "PSG", km: 660 }]),
});

/* ------------------------------------------------------------------ OL */
const ol = buildClub({
  seed: 31,
  identity: {
    slug: "olympique-lyonnais",
    name: "Olympique Lyonnais",
    shortName: "OL",
    founded: 1950,
    stadium: "Groupama Stadium",
    stadiumCapacity: 59186,
    city: "Lyon",
    competition: LIGUE1,
    colors: { primary: "#E4002B", secondary: "#0033A0" },
  },
  honours: [
    { label: "Ligue 1", count: 7, years: [2008, 2007, 2006, 2005, 2004, 2003, 2002], tier: "domestic" },
    { label: "Coupe de France", count: 5, years: [2012, 2008, 1973], tier: "cup" },
    { label: "Trophée des Champions", count: 8, years: [2012, 2007, 2006], tier: "other" },
  ],
  records: [
    { label: "Record league win", value: "7–0", detail: "v Le Havre, 2007", source: src("Club archive", "2026-08-01") },
    { label: "Most appearances", value: "543", detail: "Serge Chiesa", source: src("Club archive", "2026-08-01") },
    { label: "Top scorer", value: "222 goals", detail: "Fleury Di Nallo", source: src("Club archive", "2026-08-01") },
    { label: "Consecutive titles", value: "7", detail: "2002–2008", source: src("Club archive", "2026-08-01") },
  ],
  squad: [
    { playerSlug: "lucas-perri", playerName: "Lucas Perri", position: "GK", shirtNumber: 1, from: "2024-01-01", until: null, contractUntil: "2028-06-30", onLoan: false, birthDate: "1997-12-10", nationality: "Brazil" },
    { playerSlug: "moussa-niakhate", playerName: "Moussa Niakhaté", position: "DF", shirtNumber: 4, from: "2024-08-01", until: null, contractUntil: "2029-06-30", onLoan: false, birthDate: "1996-03-08", nationality: "Senegal" },
    { playerSlug: "clinton-mata", playerName: "Clinton Mata", position: "DF", shirtNumber: 3, from: "2023-07-01", until: null, contractUntil: "2027-06-30", onLoan: false, birthDate: "1992-11-24", nationality: "Angola" },
    { playerSlug: "nicolas-tagliafico", playerName: "Nicolás Tagliafico", position: "DF", shirtNumber: 12, from: "2022-07-01", until: null, contractUntil: "2027-06-30", onLoan: false, birthDate: "1992-08-31", nationality: "Argentina" },
    { playerSlug: "ainsley-maitland-niles", playerName: "Ainsley Maitland-Niles", position: "DF", shirtNumber: 15, from: "2024-07-01", until: null, contractUntil: "2027-06-30", onLoan: false, birthDate: "1997-08-29", nationality: "England" },
    { playerSlug: "corentin-tolisso", playerName: "Corentin Tolisso", position: "MF", shirtNumber: 88, from: "2022-07-01", until: null, contractUntil: "2027-06-30", onLoan: false, birthDate: "1994-08-03", nationality: "France" },
    { playerSlug: "tanner-tessmann", playerName: "Tanner Tessmann", position: "MF", shirtNumber: 6, from: "2025-01-15", until: null, contractUntil: "2029-06-30", onLoan: false, birthDate: "2001-09-24", nationality: "United States" },
    { playerSlug: "nemanja-matic", playerName: "Nemanja Matić", position: "MF", shirtNumber: 31, from: "2025-01-20", until: null, contractUntil: "2027-06-30", onLoan: false, birthDate: "1988-08-01", nationality: "Serbia" },
    { playerSlug: "rayan-cherki", playerName: "Rayan Cherki", position: "MF", shirtNumber: 18, from: "2019-08-01", until: null, contractUntil: "2027-06-30", onLoan: false, birthDate: "2003-08-17", nationality: "France" },
    { playerSlug: "malick-fofana", playerName: "Malick Fofana", position: "FW", shirtNumber: 11, from: "2024-01-01", until: null, contractUntil: "2029-06-30", onLoan: false, birthDate: "2005-03-31", nationality: "Belgium" },
    { playerSlug: "georges-mikautadze", playerName: "Georges Mikautadze", position: "FW", shirtNumber: 69, from: "2024-08-01", until: null, contractUntil: "2029-06-30", onLoan: false, birthDate: "2000-10-31", nationality: "Georgia" },
    { playerSlug: "alexandre-lacazette", playerName: "Alexandre Lacazette", position: "FW", shirtNumber: 10, from: "2022-07-01", until: null, contractUntil: "2027-06-30", onLoan: false, birthDate: "1991-05-28", nationality: "France" },
    { playerSlug: "saeel-kumbedi", playerName: "Saël Kumbedi", position: "DF", shirtNumber: 27, from: "2022-07-01", until: null, contractUntil: null, onLoan: false, birthDate: "2005-03-26", nationality: "France" },
    { playerSlug: "mahamadou-diawara", playerName: "Mahamadou Diawara", position: "MF", shirtNumber: 26, from: "2023-08-01", until: null, contractUntil: "2028-06-30", onLoan: false, birthDate: "2004-11-16", nationality: "France" },
  ],
  cardPlan: [
    { slug: "nemanja-matic", yellows: 5, recent: true },
    { slug: "corentin-tolisso", yellows: 4 },
    { slug: "moussa-niakhate", yellows: 4 },
    { slug: "clinton-mata", yellows: 3 },
    { slug: "tanner-tessmann", yellows: 2, red: "red", redRecency: 2 },
    { slug: "rayan-cherki", yellows: 2 },
    { slug: "nicolas-tagliafico", yellows: 3 },
  ],
  absencePlan: [
    { slug: "tanner-tessmann", reason: "suspension", count: 2 },
    { slug: "alexandre-lacazette", reason: "injury", count: 3, note: "Calf" },
    { slug: "saeel-kumbedi", reason: "injury", count: 1, note: "Knock" },
    { slug: "malick-fofana", reason: "international", count: 2 },
  ],
  opponents: opponentsFor("OL", [{ name: "Paris Saint-Germain", short: "PSG", km: 395 }]),
});

for (const club of [psg, om, ol]) {
  writeFileSync(`data/clubs/${club.identity.slug}.json`, JSON.stringify(club, null, 2) + "\n");
  console.log(`${club.identity.slug}: ${club.fixtures.length} fixtures, ${club.cards.length} cards, ${club.absences.length} absences`);
}
