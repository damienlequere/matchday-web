import type { AbsenceRecord, Club, Stint } from "@/types/club";

/**
 * Availability history.
 *
 * Strictly retrospective: matches already missed, and why. It is derivable
 * from what is already stored, which is what makes it a calculable block.
 *
 * What is *not* here: expected returns. "Back in two weeks" is an inference
 * over contradictory sources and belongs to the injury block (`lib/injuries`),
 * which models it as `Inference` rather than fact. Keeping the two apart in
 * the code is the same discipline the type system enforces between `Fact` and
 * `Inference`.
 */

export interface AvailabilityRow {
  stint: Stint;
  missed: number;
  /** Fixtures played by the club while this player was at the club. */
  eligible: number;
  /** Share of eligible fixtures missed, 0-1. */
  missedShare: number;
  byReason: Record<AbsenceRecord["reason"], number>;
  records: AbsenceRecord[];
}

export interface AvailabilitySummary {
  rows: AvailabilityRow[];
  /** Total player-matches lost across the squad. */
  totalMissed: number;
  /** Lost to suspension specifically — the avoidable share. */
  missedToSuspension: number;
}

export function computeAvailability(club: Club, now: Date): AvailabilitySummary {
  const played = club.fixtures.filter(
    (f) => f.result && new Date(f.kickoff) <= now,
  );

  const byPlayer = new Map<string, AbsenceRecord[]>();
  for (const record of club.absences) {
    const bucket = byPlayer.get(record.playerSlug);
    if (bucket) bucket.push(record);
    else byPlayer.set(record.playerSlug, [record]);
  }

  const rows: AvailabilityRow[] = club.squad
    .filter((s) => s.until === null)
    .map((stint) => {
      const records = byPlayer.get(stint.playerSlug) ?? [];

      // A player who signed in January cannot have missed August fixtures.
      const eligible = played.filter(
        (f) => f.kickoff.slice(0, 10) >= stint.from,
      ).length;

      const byReason: AvailabilityRow["byReason"] = {
        suspension: 0,
        injury: 0,
        international: 0,
        other: 0,
      };
      for (const record of records) byReason[record.reason] += 1;

      return {
        stint,
        missed: records.length,
        eligible,
        missedShare: eligible ? records.length / eligible : 0,
        byReason,
        records: [...records].sort((a, b) => b.date.localeCompare(a.date)),
      };
    })
    .filter((row) => row.missed > 0)
    .sort((a, b) => b.missed - a.missed || a.stint.playerName.localeCompare(b.stint.playerName));

  return {
    rows,
    totalMissed: club.absences.length,
    missedToSuspension: club.absences.filter((a) => a.reason === "suspension").length,
  };
}
