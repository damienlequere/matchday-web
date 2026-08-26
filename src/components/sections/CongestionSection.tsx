import type { CongestionSummary, FixtureLoad } from "@/lib/congestion";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/sections/Section";
import {
  formatDays,
  formatKickoff,
  formatNumber,
  formatWeekdayDate,
} from "@/lib/format";

import styles from "./CongestionSection.module.css";

/**
 * Fixture congestion.
 *
 * Everyone publishes the fixture list; nobody publishes what it costs. Rest
 * days, three-match weeks and travel are all arithmetic over dates already in
 * the schedule, which is what makes this defensible without any daily work.
 */

const SEVERITY_LABEL: Record<FixtureLoad["severity"], string> = {
  normal: "Normal",
  tight: "Tight",
  heavy: "Heavy",
};

/** Bar width encodes severity so the column scans without reading each label. */
const SEVERITY_WIDTH: Record<FixtureLoad["severity"], string> = {
  normal: "34%",
  tight: "67%",
  heavy: "100%",
};

export function CongestionSection({ congestion }: { congestion: CongestionSummary }) {
  return (
    <Section
      id="congestion"
      title="Fixture congestion"
      lede="What the next run of matches actually costs: turnaround between games, matches inside a rolling eight days, and kilometres travelled."
    >
      <div className={styles.wrapper}>
        <div className={styles.summary}>
          <div className={styles.cell}>
            <div className={styles.cellLabel}>Next matches</div>
            <div className={styles.cellValue}>{congestion.matchCount}</div>
          </div>
          <div className={styles.cell}>
            <div className={styles.cellLabel}>Across</div>
            <div className={styles.cellValue}>{congestion.spanDays}d</div>
          </div>
          <div className={styles.cell}>
            <div className={styles.cellLabel}>Shortest rest</div>
            <div className={styles.cellValue}>
              {congestion.shortestRest === null ? "—" : `${congestion.shortestRest}d`}
            </div>
          </div>
          <div className={styles.cell}>
            <div className={styles.cellLabel}>Travel</div>
            <div className={styles.cellValue}>
              {formatNumber(congestion.totalTravelKm)}km
            </div>
          </div>
        </div>

        <Card padded={false}>
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Fixture</th>
                  <th scope="col" className={styles.num}>Rest</th>
                  <th scope="col" className={styles.num}>In 8 days</th>
                  <th scope="col" className={styles.num}>Travel</th>
                  <th scope="col">Load</th>
                </tr>
              </thead>
              <tbody>
                {congestion.loads.map((load) => (
                  <tr key={load.fixture.id}>
                    <td>
                      {formatWeekdayDate(load.fixture.kickoff)}
                      <br />
                      <span className={styles.comp}>
                        {formatKickoff(load.fixture.kickoff)}
                      </span>
                    </td>
                    <td>
                      <span className={styles.venue}>
                        {load.fixture.venue === "home" ? "H" : "A"}
                      </span>
                      <span className={styles.opponent}>
                        {load.fixture.opponent}
                      </span>
                      <br />
                      <span className={styles.comp}>
                        {load.fixture.competition}
                      </span>
                    </td>
                    <td className={styles.num}>
                      {load.restDays === null ? "—" : formatDays(load.restDays)}
                    </td>
                    <td className={styles.num}>{load.matchesInEightDays}</td>
                    <td className={styles.num}>
                      {load.travelKm ? `${formatNumber(load.travelKm)}km` : "—"}
                    </td>
                    <td className={styles.severityCell}>
                      <span
                        className={`${styles.bar} ${styles[load.severity]}`}
                        style={{ width: SEVERITY_WIDTH[load.severity] }}
                        role="img"
                        aria-label={SEVERITY_LABEL[load.severity]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Section>
  );
}
