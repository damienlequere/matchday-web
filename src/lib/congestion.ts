import type { Club, Fixture } from "@/types/club";

import { upcomingFixtures } from "@/lib/discipline";

/**
 * Fixture congestion.
 *
 * The note's argument: everyone publishes the fixture list, nobody publishes
 * what it *costs*. Three matches in eight days with a trip to Lens in the
 * middle is the thing that explains rotation, and it is pure arithmetic over
 * dates and distances.
 */

const DAY_MS = 86_400_000;

export interface FixtureLoad {
  fixture: Fixture;
  /** Days since the previous fixture. Null for the first of the window. */
  restDays: number | null;
  /** Matches played in the 8 days ending with this one, inclusive. */
  matchesInEightDays: number;
  /** Travel for this fixture, km. */
  travelKm: number;
  /**
   * Congestion severity, derived only from rest and density.
   * Deliberately coarse: a three-level scale is defensible, a 0-100 score
   * would imply a precision the inputs do not carry.
   */
  severity: "normal" | "tight" | "heavy";
}

export interface CongestionSummary {
  loads: FixtureLoad[];
  /** Total km over the window. */
  totalTravelKm: number;
  /** Windows of 8 days containing 3+ matches. */
  heavyWeeks: number;
  /** Shortest turnaround in the window, days. */
  shortestRest: number | null;
  matchCount: number;
  /** Days spanned by the window. */
  spanDays: number;
}

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / DAY_MS,
  );
}

function severityFor(restDays: number | null, density: number): FixtureLoad["severity"] {
  if (density >= 3 || (restDays !== null && restDays <= 2)) return "heavy";
  if (density === 2 || (restDays !== null && restDays <= 3)) return "tight";
  return "normal";
}

/**
 * Build the congestion picture for the next `count` fixtures.
 *
 * The fixture immediately *before* the window is included in the rest-day
 * calculation but not in the output: a supporter reading "3 days rest" for the
 * first upcoming match needs the last played match to make that true.
 */
export function computeCongestion(
  club: Club,
  now: Date,
  count = 6,
): CongestionSummary {
  const upcoming = upcomingFixtures(club, now).slice(0, count);

  const lastPlayed = club.fixtures
    .filter((f) => f.result && new Date(f.kickoff) < now)
    .sort((a, b) => b.kickoff.localeCompare(a.kickoff))[0];

  const timeline = lastPlayed ? [lastPlayed, ...upcoming] : upcoming;

  const loads: FixtureLoad[] = [];

  for (let i = 0; i < timeline.length; i += 1) {
    const fixture = timeline[i];
    if (!fixture) continue;
    // Skip the anchor: it is context for the first rest figure, not content.
    if (lastPlayed && i === 0) continue;

    const previous = timeline[i - 1];
    const restDays = previous ? daysBetween(previous.kickoff, fixture.kickoff) : null;

    // Density counts every fixture whose kickoff falls in the trailing 8 days,
    // including ones already played — the legs do not care which side of today
    // a match sat on.
    const windowStart = new Date(
      new Date(fixture.kickoff).getTime() - 8 * DAY_MS,
    ).toISOString();
    const matchesInEightDays = club.fixtures.filter(
      (f) => f.kickoff > windowStart && f.kickoff <= fixture.kickoff,
    ).length;

    loads.push({
      fixture,
      restDays,
      matchesInEightDays,
      travelKm: fixture.travelKm,
      severity: severityFor(restDays, matchesInEightDays),
    });
  }

  const rests = loads
    .map((l) => l.restDays)
    .filter((r): r is number => r !== null);

  const first = loads[0]?.fixture.kickoff;
  const last = loads.at(-1)?.fixture.kickoff;

  return {
    loads,
    totalTravelKm: loads.reduce((sum, l) => sum + l.travelKm, 0),
    heavyWeeks: loads.filter((l) => l.matchesInEightDays >= 3).length,
    shortestRest: rests.length ? Math.min(...rests) : null,
    matchCount: loads.length,
    spanDays: first && last ? daysBetween(first, last) : 0,
  };
}
