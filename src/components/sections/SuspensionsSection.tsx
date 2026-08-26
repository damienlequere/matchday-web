import type { ClubDisciplineSummary, PlayerDiscipline } from "@/lib/discipline";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Section } from "@/components/sections/Section";
import { formatDecimal, formatMatches, formatShortDate } from "@/lib/format";

import styles from "./SuspensionsSection.module.css";

/**
 * Suspensions and card accumulation — the hub's strongest asset.
 *
 * Every figure here is computed from card events at render time. Nothing is
 * stored as a conclusion, which is why the block cannot drift out of date
 * relative to the facts underneath it.
 */

const REASON_LABEL: Record<NonNullable<PlayerDiscipline["reason"]>, string> = {
  threshold: "Card accumulation",
  red: "Straight red",
  "second-yellow": "Two yellows",
};

function Pips({ held, threshold }: { held: number; threshold: number }) {
  return (
    <span className={styles.pips} aria-hidden="true">
      {Array.from({ length: threshold }, (_, i) => (
        <span
          key={i}
          className={[
            styles.pip,
            i < held ? styles.pipOn : "",
            i < held && held === threshold - 1 ? styles.pipDanger : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      ))}
    </span>
  );
}

export function SuspensionsSection({
  discipline,
  summary,
}: {
  discipline: PlayerDiscipline[];
  summary: ClubDisciplineSummary;
}) {
  const suspended = discipline.filter((d) => d.suspendedNow);
  const atRisk = discipline.filter((d) => d.atRisk);
  const carrying = discipline.filter(
    (d) => !d.suspendedNow && !d.atRisk && d.yellowsTowardBan > 0,
  );

  return (
    <Section
      id="suspensions"
      title="Suspensions & cards"
      lede="Computed from public match reports against each competition's own rules. No judgement, no collection — the same inputs always give the same answer."
    >
      <div className={styles.grid}>
        <Card>
          <p className={styles.blockTitle}>Out through suspension</p>
          {suspended.length === 0 ? (
            <p className={styles.empty}>
              Nobody is currently serving a ban.
            </p>
          ) : (
            suspended.map((row) => (
              <div className={styles.row} key={`${row.playerSlug}-${row.competition}`}>
                <div>
                  <div className={styles.who}>
                    <span className={styles.shirt}>
                      {row.shirtNumber ?? "—"}
                    </span>
                    <span className={styles.player}>{row.playerName}</span>
                  </div>
                  <p className={styles.detail}>
                    {row.reason ? REASON_LABEL[row.reason] : "Suspended"} ·{" "}
                    <span className={styles.comp}>{row.competition}</span>
                  </p>
                  {row.missedFixtures.length > 0 ? (
                    <p className={styles.missed}>
                      Misses{" "}
                      {row.missedFixtures
                        .map(
                          (f) =>
                            `${f.venue === "home" ? "v" : "at"} ${f.opponentShort} (${formatShortDate(f.kickoff)})`,
                        )
                        .join(", ")}
                    </p>
                  ) : null}
                </div>
                <div className={styles.right}>
                  <Pill tone="crit">{formatMatches(row.matchesRemaining)}</Pill>
                </div>
              </div>
            ))
          )}

          <p className={`${styles.blockTitle} ${styles.spaced}`}>
            One card from a ban
          </p>
          {atRisk.length === 0 ? (
            <p className={styles.empty}>Nobody is on the threshold.</p>
          ) : (
            atRisk.map((row) => (
              <div className={styles.row} key={`${row.playerSlug}-${row.competition}`}>
                <div>
                  <div className={styles.who}>
                    <span className={styles.shirt}>
                      {row.shirtNumber ?? "—"}
                    </span>
                    <span className={styles.player}>{row.playerName}</span>
                  </div>
                  <p className={styles.detail}>
                    {row.yellowsTowardBan} of {row.threshold} yellows ·{" "}
                    <span className={styles.comp}>{row.competition}</span>
                  </p>
                  <Pips held={row.yellowsTowardBan} threshold={row.threshold} />
                </div>
                <div className={styles.right}>
                  <Pill tone="warn">At risk</Pill>
                </div>
              </div>
            ))
          )}
        </Card>

        <div>
          <Card>
            <p className={styles.blockTitle}>Squad discipline</p>
            <div className={styles.summary}>
              <div className={styles.cell}>
                <div className={styles.cellLabel}>Yellow cards</div>
                <div className={styles.cellValue}>{summary.yellows}</div>
              </div>
              <div className={styles.cell}>
                <div className={styles.cellLabel}>Dismissals</div>
                <div className={styles.cellValue}>
                  {summary.reds + summary.secondYellows}
                </div>
              </div>
              <div className={styles.cell}>
                <div className={styles.cellLabel}>Cards per match</div>
                <div className={styles.cellValue}>
                  {formatDecimal(summary.cardsPerMatch, 2)}
                </div>
              </div>
              <div className={styles.cell}>
                <div className={styles.cellLabel}>On the threshold</div>
                <div className={styles.cellValue}>{summary.atRiskCount}</div>
              </div>
            </div>
          </Card>

          {carrying.length > 0 ? (
            <Card className={styles.stacked}>
              <p className={styles.blockTitle}>Carrying cards</p>
              {carrying.map((row) => (
                <div className={styles.row} key={`${row.playerSlug}-${row.competition}`}>
                  <div>
                    <div className={styles.who}>
                      <span className={styles.shirt}>
                        {row.shirtNumber ?? "—"}
                      </span>
                      <span className={styles.player}>{row.playerName}</span>
                    </div>
                    <Pips held={row.yellowsTowardBan} threshold={row.threshold} />
                  </div>
                  <div className={styles.right}>
                    <span className={styles.comp}>
                      {row.yellowsTowardBan}/{row.threshold}
                    </span>
                  </div>
                </div>
              ))}
            </Card>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
