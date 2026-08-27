import type { ClubDisciplineSummary, PlayerDiscipline } from "@/lib/discipline";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Section } from "@/components/sections/Section";
import { formatDecimal, formatMatches, formatShortDate } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

import styles from "./SuspensionsSection.module.css";

/**
 * Suspensions and card accumulation — the hub's strongest asset.
 *
 * Every figure here is computed from card events at render time. Nothing is
 * stored as a conclusion, which is why the block cannot drift out of date
 * relative to the facts underneath it.
 */

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
  dict,
  locale,
  nested,
}: {
  discipline: PlayerDiscipline[];
  summary: ClubDisciplineSummary;
  dict: Dictionary;
  locale: Locale;
  /** Folded into the squad-status drawer; see `Section`. */
  nested?: boolean;
}) {
  const suspended = discipline.filter((d) => d.suspendedNow);
  const atRisk = discipline.filter((d) => d.atRisk);
  const carrying = discipline.filter(
    (d) => !d.suspendedNow && !d.atRisk && d.yellowsTowardBan > 0,
  );

  return (
    <Section
      id="suspensions"
      title={dict.suspensions.title}
      lede={dict.suspensions.lede}
      nested={nested}
    >
      <div className={styles.grid}>
        <Card>
          <p className={styles.blockTitle}>{dict.suspensions.out}</p>
          {suspended.length === 0 ? (
            <p className={styles.empty}>{dict.suspensions.noneServing}</p>
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
                    {row.reason
                      ? dict.suspensions.reason[row.reason]
                      : dict.suspensions.suspendedFallback}{" "}
                    ·{" "}
                    <span className={styles.comp}>{row.competition}</span>
                  </p>
                  {row.missedFixtures.length > 0 ? (
                    <p className={styles.missed}>
                      {dict.suspensions.misses(
                        row.missedFixtures
                          .map(
                            (f) =>
                              `${f.venue === "home" ? dict.suspensions.versus : dict.suspensions.at} ${f.opponentShort} (${formatShortDate(locale, f.kickoff)})`,
                          )
                          .join(", "),
                      )}
                    </p>
                  ) : null}
                </div>
                <div className={styles.right}>
                  <Pill tone="crit">
                    {formatMatches(locale, row.matchesRemaining)}
                  </Pill>
                </div>
              </div>
            ))
          )}

          <p className={`${styles.blockTitle} ${styles.spaced}`}>
            {dict.suspensions.oneCardAway}
          </p>
          {atRisk.length === 0 ? (
            <p className={styles.empty}>{dict.suspensions.noneOnThreshold}</p>
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
                    {dict.suspensions.yellowsOf(
                      row.yellowsTowardBan,
                      row.threshold,
                    )}{" "}
                    ·{" "}
                    <span className={styles.comp}>{row.competition}</span>
                  </p>
                  <Pips held={row.yellowsTowardBan} threshold={row.threshold} />
                </div>
                <div className={styles.right}>
                  <Pill tone="warn">{dict.suspensions.atRiskPill}</Pill>
                </div>
              </div>
            ))
          )}
        </Card>

        <div>
          <Card>
            <p className={styles.blockTitle}>{dict.suspensions.squadDiscipline}</p>
            <div className={styles.summary}>
              <div className={styles.cell}>
                <div className={styles.cellLabel}>{dict.suspensions.yellowCards}</div>
                <div className={styles.cellValue}>{summary.yellows}</div>
              </div>
              <div className={styles.cell}>
                <div className={styles.cellLabel}>{dict.suspensions.dismissals}</div>
                <div className={styles.cellValue}>
                  {summary.reds + summary.secondYellows}
                </div>
              </div>
              <div className={styles.cell}>
                <div className={styles.cellLabel}>
                  {dict.suspensions.cardsPerMatch}
                </div>
                <div className={styles.cellValue}>
                  {formatDecimal(locale, summary.cardsPerMatch, 2)}
                </div>
              </div>
              <div className={styles.cell}>
                <div className={styles.cellLabel}>
                  {dict.suspensions.onThreshold}
                </div>
                <div className={styles.cellValue}>{summary.atRiskCount}</div>
              </div>
            </div>
          </Card>

          {carrying.length > 0 ? (
            <Card className={styles.stacked}>
              <p className={styles.blockTitle}>{dict.suspensions.carrying}</p>
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
