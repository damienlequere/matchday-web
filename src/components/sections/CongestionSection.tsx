import type { CongestionSummary, FixtureLoad } from "@/lib/congestion";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/sections/Section";
import {
  formatDays,
  formatDaysShort,
  formatKickoff,
  formatNumber,
  formatWeekdayDate,
} from "@/lib/format";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

import styles from "./CongestionSection.module.css";

/**
 * Fixture congestion.
 *
 * Everyone publishes the fixture list; nobody publishes what it costs. Rest
 * days, three-match weeks and travel are all arithmetic over dates already in
 * the schedule, which is what makes this defensible without any daily work.
 */

/** Bar width encodes severity so the column scans without reading each label. */
const SEVERITY_WIDTH: Record<FixtureLoad["severity"], string> = {
  normal: "34%",
  tight: "67%",
  heavy: "100%",
};

export function CongestionSection({
  congestion,
  dict,
  locale,
}: {
  congestion: CongestionSummary;
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <Section
      id="congestion"
      title={dict.congestion.title}
      lede={dict.congestion.lede}
    >
      <div className={styles.wrapper}>
        <div className={styles.summary}>
          <div className={styles.cell}>
            <div className={styles.cellLabel}>{dict.congestion.nextMatches}</div>
            <div className={styles.cellValue}>{congestion.matchCount}</div>
          </div>
          <div className={styles.cell}>
            <div className={styles.cellLabel}>{dict.congestion.across}</div>
            <div className={styles.cellValue}>
              {formatDaysShort(locale, congestion.spanDays)}
            </div>
          </div>
          <div className={styles.cell}>
            <div className={styles.cellLabel}>
              {dict.congestion.shortestRest}
            </div>
            <div className={styles.cellValue}>
              {congestion.shortestRest === null
                ? "—"
                : formatDaysShort(locale, congestion.shortestRest)}
            </div>
          </div>
          <div className={styles.cell}>
            <div className={styles.cellLabel}>{dict.congestion.travel}</div>
            <div className={styles.cellValue}>
              {formatNumber(locale, congestion.totalTravelKm)}km
            </div>
          </div>
        </div>

        <Card padded={false}>
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">{dict.congestion.table.date}</th>
                  <th scope="col">{dict.congestion.table.fixture}</th>
                  <th scope="col" className={styles.num}>
                    {dict.congestion.table.rest}
                  </th>
                  <th scope="col" className={styles.num}>
                    {dict.congestion.table.inEightDays}
                  </th>
                  <th scope="col" className={styles.num}>
                    {dict.congestion.table.travel}
                  </th>
                  <th scope="col">{dict.congestion.table.load}</th>
                </tr>
              </thead>
              <tbody>
                {congestion.loads.map((load) => (
                  <tr key={load.fixture.id}>
                    <td>
                      {formatWeekdayDate(locale, load.fixture.kickoff)}
                      <br />
                      <span className={styles.comp}>
                        {formatKickoff(locale, load.fixture.kickoff)}
                      </span>
                    </td>
                    <td>
                      <span className={styles.venue}>
                        {load.fixture.venue === "home"
                          ? dict.congestion.home
                          : dict.congestion.away}
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
                      {load.restDays === null
                        ? "—"
                        : formatDays(locale, load.restDays)}
                    </td>
                    <td className={styles.num}>{load.matchesInEightDays}</td>
                    <td className={styles.num}>
                      {load.travelKm
                        ? `${formatNumber(locale, load.travelKm)}km`
                        : "—"}
                    </td>
                    <td className={styles.severityCell}>
                      <span
                        className={`${styles.bar} ${styles[load.severity]}`}
                        style={{ width: SEVERITY_WIDTH[load.severity] }}
                        role="img"
                        aria-label={dict.congestion.severity[load.severity]}
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
