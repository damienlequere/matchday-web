import type { CongestionSummary, FixtureLoad } from "@/lib/congestion";
import { Card } from "@/components/ui/Card";
import { Pill, type PillTone } from "@/components/ui/Pill";
import { Section } from "@/components/sections/Section";
import {
  formatDays,
  formatDaysShort,
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
 *
 * The table prints the verdict, not the ingredients. Rest days and eight-day
 * density are the two inputs `severity` is derived from, so giving each its own
 * column beside a coloured bar published the same fact three times in three
 * notations and left the reader to work out which one ranked. They are now one
 * sentence under one pill: the pill judges, the sentence shows the working.
 *
 * Competition and kick-off time were dropped rather than restyled. Both are
 * already in the fixtures section, and here they crowded out the quarter of the
 * row that is this site's actual argument.
 */

/** Severity maps onto the shared status palette; the pill carries the word. */
const SEVERITY_TONE: Record<FixtureLoad["severity"], PillTone> = {
  normal: "ok",
  tight: "warn",
  heavy: "crit",
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
        {/*
          Three tiles, not four: "6 matches" and "across 34 days" are one
          sentence, and splitting them gave the window's span the same weight as
          the figures that actually carry a warning.
        */}
        <div className={styles.summary}>
          <div className={styles.cell}>
            <div className={styles.cellLabel}>{dict.congestion.nextMatches}</div>
            <div className={styles.cellValue}>{congestion.matchCount}</div>
            <div className={styles.cellNote}>
              {dict.congestion.across}{" "}
              {formatDaysShort(locale, congestion.spanDays)}
            </div>
          </div>
          {/*
            The one figure here that can alarm, so it is the one allowed to
            colour. The threshold matches `severityFor`: two days or less is
            what the row-level scale already calls heavy.
          */}
          <div className={styles.cell}>
            <div className={styles.cellLabel}>
              {dict.congestion.shortestRest}
            </div>
            <div
              className={`${styles.cellValue} ${
                congestion.shortestRest !== null && congestion.shortestRest <= 2
                  ? styles.alarm
                  : ""
              }`}
            >
              {congestion.shortestRest === null
                ? "—"
                : formatDaysShort(locale, congestion.shortestRest)}
            </div>
            {congestion.heavyWeeks > 0 ? (
              <div className={styles.cellNote}>
                {dict.congestion.heavyWeeks(congestion.heavyWeeks)}
              </div>
            ) : null}
          </div>
          <div className={styles.cell}>
            <div className={styles.cellLabel}>{dict.congestion.travel}</div>
            <div className={styles.cellValue}>
              {formatNumber(locale, congestion.totalTravelKm)} km
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
                  <th scope="col">{dict.congestion.table.load}</th>
                  <th scope="col" className={styles.num}>
                    {dict.congestion.table.travel}
                  </th>
                </tr>
              </thead>
              <tbody>
                {congestion.loads.map((load) => (
                  <tr key={load.fixture.id}>
                    <td className={styles.dateCell}>
                      {formatWeekdayDate(locale, load.fixture.kickoff)}
                    </td>
                    <td>
                      <span className={styles.opponent}>
                        {load.fixture.opponent}
                      </span>
                      <span className={styles.venue}>
                        {load.fixture.venue === "home"
                          ? dict.congestion.home
                          : dict.congestion.away}
                      </span>
                    </td>
                    <td>
                      <Pill tone={SEVERITY_TONE[load.severity]}>
                        {dict.congestion.severity[load.severity]}
                      </Pill>
                      {/*
                        The working, under the verdict. Rest is missing only for
                        the first row of the window, where there is no previous
                        fixture to measure against — density still stands alone.
                      */}
                      <span className={styles.loadDetail}>
                        {load.restDays === null
                          ? dict.congestion.load.densityOnly(
                              load.matchesInEightDays,
                            )
                          : dict.congestion.load.detail(
                              formatDays(locale, load.restDays),
                              load.matchesInEightDays,
                            )}
                      </span>
                    </td>
                    <td className={styles.num}>
                      {load.travelKm
                        ? `${formatNumber(locale, load.travelKm)} km`
                        : "—"}
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
