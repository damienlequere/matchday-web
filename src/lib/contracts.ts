import type { Club, Stint } from "@/types/club";

/**
 * Contract expiries.
 *
 * Semi-evergreen and, per the note, never offered as an overview. The value is
 * not the individual date — it is seeing the whole squad's dates at once, which
 * is exactly what the relational model makes possible and free text did not.
 */

export type ContractStatus =
  | "expiring"        // runs out at the end of the current season
  | "final-year"      // last full season before expiry
  | "secure"
  | "unknown";        // genuinely not known — never guessed

export interface ContractRow {
  stint: Stint;
  status: ContractStatus;
  /** Months remaining from `now`. Null when the date is unknown. */
  monthsRemaining: number | null;
  /** Age in years at `now`, for reading an expiry in context. */
  age: number;
}

export interface ContractSummary {
  rows: ContractRow[];
  expiringCount: number;
  finalYearCount: number;
  unknownCount: number;
  /** ISO date of the season end used as the reference point. */
  seasonEnd: string;
}

function monthsBetween(from: Date, to: Date): number {
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth())
  );
}

function yearsSince(iso: string, now: Date): number {
  const birth = new Date(iso);
  let age = now.getFullYear() - birth.getFullYear();
  const monthDelta = now.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

/**
 * European seasons end on 30 June. A contract "to 2027" means 30 June 2027,
 * which is why the reference point is a season boundary rather than today plus
 * twelve months.
 */
function seasonEndFor(now: Date): string {
  const year = now.getMonth() >= 6 ? now.getFullYear() + 1 : now.getFullYear();
  return `${year}-06-30`;
}

export function computeContracts(club: Club, now: Date): ContractSummary {
  const seasonEnd = seasonEndFor(now);
  const nextSeasonEnd = `${Number(seasonEnd.slice(0, 4)) + 1}-06-30`;

  const rows: ContractRow[] = club.squad
    .filter((s) => s.until === null)
    .map((stint) => {
      if (!stint.contractUntil) {
        return {
          stint,
          status: "unknown" as const,
          monthsRemaining: null,
          age: yearsSince(stint.birthDate, now),
        };
      }

      const status: ContractStatus =
        stint.contractUntil <= seasonEnd
          ? "expiring"
          : stint.contractUntil <= nextSeasonEnd
            ? "final-year"
            : "secure";

      return {
        stint,
        status,
        monthsRemaining: monthsBetween(now, new Date(stint.contractUntil)),
        age: yearsSince(stint.birthDate, now),
      };
    })
    .sort(rankContract);

  return {
    rows,
    expiringCount: rows.filter((r) => r.status === "expiring").length,
    finalYearCount: rows.filter((r) => r.status === "final-year").length,
    unknownCount: rows.filter((r) => r.status === "unknown").length,
    seasonEnd,
  };
}

const STATUS_ORDER: Record<ContractStatus, number> = {
  expiring: 0,
  "final-year": 1,
  unknown: 2,
  secure: 3,
};

function rankContract(a: ContractRow, b: ContractRow): number {
  const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
  if (byStatus !== 0) return byStatus;
  if (a.monthsRemaining !== null && b.monthsRemaining !== null) {
    if (a.monthsRemaining !== b.monthsRemaining) {
      return a.monthsRemaining - b.monthsRemaining;
    }
  }
  return a.stint.playerName.localeCompare(b.stint.playerName);
}
