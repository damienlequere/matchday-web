/**
 * Domain model.
 *
 * Two rules from the design note govern every type in this file:
 *
 *  1. The club is the root entity. A squad is reconstructed by resolving
 *     `Stint` rows, never by scanning players and trusting spelling.
 *  2. A fact and an inference never share a field. `Fact<T>` carries a
 *     verifiable value with its own provenance; `Inference<T>` carries a
 *     judgement with an explicit confidence level. Mixing them would let the
 *     page state a guess in the voice of a record.
 */

/* ---------------------------------------------------------------------------
   Provenance
   -------------------------------------------------------------------------*/

/**
 * How a datum came to be known. Ordered from strongest to weakest so a
 * consumer can compare levels, and so the UI can degrade its wording rather
 * than hide the difference.
 */
export type Confidence = "official" | "reported" | "derived" | "estimated";

/**
 * Provenance attaches to a *datum*, not to a block.
 *
 * The prototype cited sources per section, which makes an error impossible to
 * localise: if a section lists four sources and one number is wrong, nothing
 * says which source produced it. Carrying the origin on the value itself is
 * what makes a mistake diagnosable.
 */
export interface SourceRef {
  /** Short label shown next to the datum, e.g. "LFP match report". */
  label: string;
  /** Optional link out. Absent for data derived in-process. */
  url?: string;
  /** ISO date the value was observed or computed. */
  observedAt: string;
}

/** A verifiable value: a card was shown, a contract runs to a date. */
export interface Fact<T> {
  kind: "fact";
  value: T;
  source: SourceRef;
}

/**
 * A judgement over contradictory or incomplete sources.
 *
 * Deliberately not interchangeable with `Fact<T>`: code that renders one must
 * choose, at the type level, how to render the other. That is the point.
 */
export interface Inference<T> {
  kind: "inference";
  value: T;
  confidence: Confidence;
  /** Why this conclusion was drawn — shown to the reader, not just logged. */
  rationale: string;
  source: SourceRef;
}

export type Known<T> = Fact<T> | Inference<T>;

export function isFact<T>(value: Known<T>): value is Fact<T> {
  return value.kind === "fact";
}

/* ---------------------------------------------------------------------------
   Club and membership
   -------------------------------------------------------------------------*/

export interface ClubIdentity {
  slug: string;
  name: string;
  /** Short form for tables and fixture rows, e.g. "PSG". */
  shortName: string;
  founded: number;
  stadium: string;
  stadiumCapacity: number;
  city: string;
  competition: string;
  /** Two brand colours, used only as a thin accent — never as page chrome. */
  colors: { primary: string; secondary: string };
}

export interface Honour {
  label: string;
  count: number;
  /** Winning years, most recent first. */
  years: number[];
  /** Domestic titles rank above continental ones in the display order. */
  tier: "continental" | "domestic" | "cup" | "other";
}

export interface ClubRecord {
  label: string;
  value: string;
  detail?: string;
  source: SourceRef;
}

/** A player's spell at a club: the dated relation the free-text field could not express. */
export interface Stint {
  playerSlug: string;
  playerName: string;
  position: Position;
  shirtNumber: number | null;
  /** ISO date the player joined. */
  from: string;
  /** ISO date the spell ended, or null while ongoing. */
  until: string | null;
  /** Contract end date. Null when unknown — never a guessed date. */
  contractUntil: string | null;
  /** True for a loan; a loan and a transfer are not the same membership. */
  onLoan: boolean;
  birthDate: string;
  nationality: string;
}

export type Position = "GK" | "DF" | "MF" | "FW";

/* ---------------------------------------------------------------------------
   Fixtures
   -------------------------------------------------------------------------*/

export type Venue = "home" | "away" | "neutral";

export interface Fixture {
  id: string;
  /** ISO date-time in UTC. */
  kickoff: string;
  competition: string;
  round?: string;
  opponent: string;
  opponentShort: string;
  venue: Venue;
  /** Straight-line travel distance in km for an away trip; 0 at home. */
  travelKm: number;
  /** Set once played. Absent for a scheduled fixture. */
  result?: FixtureResult;
}

export interface FixtureResult {
  goalsFor: number;
  goalsAgainst: number;
}

/* ---------------------------------------------------------------------------
   Discipline
   -------------------------------------------------------------------------*/

export type CardType = "yellow" | "second-yellow" | "red";

/**
 * A single card shown in a single fixture.
 *
 * Suspensions are never stored: they are computed from these rows against the
 * competition rules below. Storing a suspension would mean maintaining a
 * derived value by hand — the exact error the note warns against.
 */
export interface CardEvent {
  playerSlug: string;
  fixtureId: string;
  /** ISO date of the fixture, denormalised so discipline can be read alone. */
  date: string;
  competition: string;
  type: CardType;
  minute: number;
  source: SourceRef;
}

/**
 * Suspension rules per competition.
 *
 * Explicit rather than hardcoded, because they differ by competition and
 * change between seasons. A calculable block is only as trustworthy as the
 * rule it applies, so the rule is data.
 */
export interface DisciplineRules {
  competition: string;
  /** Yellow cards that trigger a ban, e.g. 5 in Ligue 1. */
  yellowThreshold: number;
  /** Matches missed for reaching the threshold. */
  yellowBanMatches: number;
  /** Matches missed for a straight red. */
  redBanMatches: number;
  /** Matches missed for two yellows in one match. */
  secondYellowBanMatches: number;
  /** Yellow count resets after this many matches, if the season does so. */
  resetAfterMatch?: number;
}

/* ---------------------------------------------------------------------------
   Availability
   -------------------------------------------------------------------------*/

export type AbsenceReason = "suspension" | "injury" | "international" | "other";

/**
 * A match a player did not play, and why.
 *
 * History only — this records what already happened. A *prospective* absence
 * ("out for three weeks") is an inference and belongs to `InjuryRecord`, which
 * keeps the judgement in a type that cannot be mistaken for a record.
 */
export interface AbsenceRecord {
  playerSlug: string;
  fixtureId: string;
  date: string;
  reason: AbsenceReason;
  note?: string;
  source: SourceRef;
}

/* ---------------------------------------------------------------------------
   Injury room
   -------------------------------------------------------------------------*/

/**
 * How far along a recovery is.
 *
 * Ordered from most to least severe so the UI can sort without a lookup, and
 * so "out" and "returned" can never be confused for one another by a typo in
 * a free-text status field.
 */
export type InjuryStage =
  | "out"        // not available, no return in sight
  | "doubtful"   // may feature; the call is made on matchday
  | "returning"  // back in training, not yet in a squad
  | "resolved";  // available again; kept briefly for context

/** Body area. A closed set, because "knee problem" and "Knee" must not split a count. */
export type InjuryArea =
  | "ankle"
  | "calf"
  | "hamstring"
  | "knee"
  | "thigh"
  | "groin"
  | "foot"
  | "shoulder"
  | "back"
  | "head"
  | "illness"
  | "other";

/**
 * A current injury: the one block on this page built from judgement.
 *
 * The split is the whole point of the type. `area` and `since` are facts —
 * a club announced them, a team sheet showed the player absent. `expectedReturn`
 * and `matchesLikelyMissed` are inferences: they reconcile a club statement, a
 * press report and a recovery norm that routinely disagree, and they carry
 * their own confidence and rationale so the page can show *why* it thinks so.
 *
 * Nothing here is stored as a plain string that mixes the two. That is what
 * stops the page stating a guess in the voice of a record.
 */
export interface InjuryRecord {
  playerSlug: string;
  stage: InjuryStage;
  area: InjuryArea;
  /** ISO date the injury was sustained or first reported. */
  since: Fact<string>;
  /**
   * Expected return date. An inference always — even a club's own "back in
   * two weeks" is a forecast, not a record. Null when no source will commit.
   */
  expectedReturn: Inference<string> | null;
  /** How many fixtures the player is judged likely to miss from `now`. */
  matchesLikelyMissed: Inference<number> | null;
  /** Where the sources disagree, said plainly. Empty when they agree. */
  conflicts: string[];
}

/* ---------------------------------------------------------------------------
   Aggregate
   -------------------------------------------------------------------------*/

/** Everything stored for one club. Computation happens downstream, never here. */
export interface Club {
  identity: ClubIdentity;
  honours: Honour[];
  records: ClubRecord[];
  squad: Stint[];
  fixtures: Fixture[];
  cards: CardEvent[];
  absences: AbsenceRecord[];
  /** Current injury room. Judgement, not record — see `InjuryRecord`. */
  injuries: InjuryRecord[];
  rules: DisciplineRules[];
  /** ISO date-time the club's dataset was last refreshed. */
  updatedAt: string;
}
