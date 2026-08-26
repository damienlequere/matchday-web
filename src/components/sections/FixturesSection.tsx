import type { Fixture } from "@/types/club";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/sections/Section";
import { formatKickoff, formatShortDate } from "@/lib/format";

import styles from "./FixturesSection.module.css";

/**
 * Fixtures — necessary, and pure commodity.
 *
 * The note is blunt about this block: everyone has it, it defends nothing. It
 * earns its place because the calculable blocks above refer to it ("misses
 * Sunday at Rennes"), not because it brings anyone to the site. Hence its
 * position near the bottom.
 */

function outcome(fixture: Fixture): "win" | "draw" | "loss" | null {
  if (!fixture.result) return null;
  const { goalsFor, goalsAgainst } = fixture.result;
  if (goalsFor > goalsAgainst) return "win";
  if (goalsFor === goalsAgainst) return "draw";
  return "loss";
}

export function FixturesSection({
  upcoming,
  recent,
}: {
  upcoming: Fixture[];
  recent: Fixture[];
}) {
  return (
    <Section
      id="fixtures"
      title="Fixtures"
      lede="The schedule the blocks above are computed against."
    >
      <div className={styles.grid}>
        <Card>
          <p className={styles.blockTitle}>Next up</p>
          {upcoming.map((fixture) => (
            <div className={styles.row} key={fixture.id}>
              <span className={styles.date}>
                {formatShortDate(fixture.kickoff)}
              </span>
              <div className={styles.middle}>
                <div>
                  <span className={styles.venue}>
                    {fixture.venue === "home" ? "H" : "A"}
                  </span>
                  <span className={styles.opponent}>{fixture.opponent}</span>
                </div>
                <div className={styles.comp}>{fixture.competition}</div>
              </div>
              <span className={styles.time}>
                {formatKickoff(fixture.kickoff)}
              </span>
            </div>
          ))}
          <p className={styles.commodity}>
            Kick-off times in UTC.
          </p>
        </Card>

        <Card>
          <p className={styles.blockTitle}>Recent results</p>
          {recent.map((fixture) => {
            const result = outcome(fixture);
            return (
              <div className={styles.row} key={fixture.id}>
                <span className={styles.date}>
                  {formatShortDate(fixture.kickoff)}
                </span>
                <div className={styles.middle}>
                  <div>
                    <span className={styles.venue}>
                      {fixture.venue === "home" ? "H" : "A"}
                    </span>
                    <span className={styles.opponent}>{fixture.opponent}</span>
                  </div>
                  <div className={styles.comp}>{fixture.competition}</div>
                </div>
                {fixture.result && result ? (
                  <span className={`${styles.score} ${styles[result]}`}>
                    {fixture.result.goalsFor}–{fixture.result.goalsAgainst}
                  </span>
                ) : null}
              </div>
            );
          })}
        </Card>
      </div>
    </Section>
  );
}
