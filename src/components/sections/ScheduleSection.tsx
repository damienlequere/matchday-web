import type { CongestionSummary, FixtureLoad } from "@/lib/congestion";
import type { Fixture } from "@/types/club";
import { Card } from "@/components/ui/Card";
import { Disclosure } from "@/components/ui/Disclosure";
import { Pill, type PillTone } from "@/components/ui/Pill";
import { Section } from "@/components/sections/Section";
import {
  formatDays,
  formatDaysShort,
  formatKickoff,
  formatNumber,
  formatShortDate,
  formatWeekdayDate,
} from "@/lib/format";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

import styles from "./ScheduleSection.module.css";

/**
 * The schedule, and what it costs.
 *
 * Everyone publishes the fixture list; nobody publishes what it costs. Rest
 * days, three-match weeks and travel are all arithmetic over dates already in
 * the schedule, which is what makes this defensible without any daily work.
 *
 * This block used to be two. A congestion table listed the next six fixtures
 * with a load verdict, and a fixtures section listed the same six again with
 * competition and kick-off time — the two columns congestion had dropped
 * precisely *because* fixtures already held them. So the page printed one list
 * twice, in two date formats, and split the row between the half that argues
 * and the half that makes the argument legible. Merged, one row carries both.
 *
 * What the merge does *not* do is promote commodity. A fixture list is
 * commodity; a fixture list where every row is priced is not, which is why the
 * joined block keeps congestion's slot near the top rather than inheriting
 * fixtures' place at the bottom. Only played results move, and they move down
 * into a drawer: they are the one part of the old fixtures section the
 * congestion table cannot stand in for, and also the part nobody arrives for.
 *
 * The `#fixtures` anchor is kept on the recent-results drawer, so links already
 * in the wild land on the part of the old section that still exists as its own
 * thing rather than on a heading that no longer says what they were promised.
 */

/** Severity maps onto the shared status palette; the pill carries the word. */
const SEVERITY_TONE: Record<FixtureLoad["severity"], PillTone> = {
  normal: "ok",
  tight: "warn",
  heavy: "crit",
};

function outcome(fixture: Fixture): "win" | "draw" | "loss" | null {
  if (!fixture.result) return null;
  const { goalsFor, goalsAgainst } = fixture.result;
  if (goalsFor > goalsAgainst) return "win";
  if (goalsFor === goalsAgainst) return "draw";
  return "loss";
}

/** W/D/L tally for the drawer's summary, so a shut drawer still says something. */
function record(fixtures: Fixture[]) {
  let w = 0;
  let d = 0;
  let l = 0;
  for (const fixture of fixtures) {
    const result = outcome(fixture);
    if (result === "win") w += 1;
    else if (result === "draw") d += 1;
    else if (result === "loss") l += 1;
  }
  return { w, d, l };
}

export function ScheduleSection({
  congestion,
  recent,
  dict,
  locale,
}: {
  congestion: CongestionSummary;
  recent: Fixture[];
  dict: Dictionary;
  locale: Locale;
}) {
  const { w, d: draws, l } = record(recent);

  return (
    <Section
      id="congestion"
      title={dict.schedule.title}
      lede={dict.schedule.lede}
    >
      <div className={styles.wrapper}>
        {/*
          Three tiles, not four: "6 matches" and "across 34 days" are one
          sentence, and splitting them gave the window's span the same weight as
          the figures that actually carry a warning.

          They sit above the table they summarise, which is the arrangement the
          merge finally makes honest — before it, the tiles summarised a table
          the reader then had to read twice.
        */}
        <div className={styles.summary}>
          <div className={styles.cell}>
            <div className={styles.cellLabel}>{dict.schedule.nextMatches}</div>
            <div className={styles.cellValue}>{congestion.matchCount}</div>
            <div className={styles.cellNote}>
              {dict.schedule.across}{" "}
              {formatDaysShort(locale, congestion.spanDays)}
            </div>
          </div>
          {/*
            The one figure here that can alarm, so it is the one allowed to
            colour. The threshold matches `severityFor`: two days or less is
            what the row-level scale already calls heavy.
          */}
          <div className={styles.cell}>
            <div className={styles.cellLabel}>{dict.schedule.shortestRest}</div>
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
            {congestion.heavyFixtures > 0 ? (
              <div className={styles.cellNote}>
                {dict.schedule.heavyFixtures(congestion.heavyFixtures)}
              </div>
            ) : null}
          </div>
          <div className={styles.cell}>
            <div className={styles.cellLabel}>{dict.schedule.travel}</div>
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
                  <th scope="col">{dict.schedule.table.date}</th>
                  <th scope="col">{dict.schedule.table.fixture}</th>
                  <th scope="col">{dict.schedule.table.competition}</th>
                  <th scope="col">{dict.schedule.table.load}</th>
                  <th scope="col" className={styles.num}>
                    {dict.schedule.table.travel}
                  </th>
                </tr>
              </thead>
              <tbody>
                {congestion.loads.map((load) => (
                  <tr key={load.fixture.id}>
                    <td className={styles.dateCell}>
                      {formatWeekdayDate(locale, load.fixture.kickoff)}
                      {/*
                        Kick-off, back on the row it belongs to. It was dropped
                        from this table only because the fixtures section held
                        it; that section is gone, and a turnaround figure reads
                        differently against a Sunday 21:00 than a Saturday 15:00.
                      */}
                      <span className={styles.kickoff}>
                        {formatKickoff(locale, load.fixture.kickoff)}
                      </span>
                    </td>
                    <td>
                      <span className={styles.opponent}>
                        {load.fixture.opponent}
                      </span>
                      <span className={styles.venue}>
                        {load.fixture.venue === "home"
                          ? dict.schedule.home
                          : dict.schedule.away}
                      </span>
                    </td>
                    <td className={styles.comp}>{load.fixture.competition}</td>
                    <td>
                      <Pill tone={SEVERITY_TONE[load.severity]}>
                        {dict.schedule.severity[load.severity]}
                      </Pill>
                      {/*
                        The working, under the verdict. Rest is missing only for
                        the first row of the window, where there is no previous
                        fixture to measure against — density still stands alone.
                      */}
                      <span className={styles.loadDetail}>
                        {load.restDays === null
                          ? dict.schedule.load.densityOnly(
                              load.matchesInEightDays,
                            )
                          : dict.schedule.load.detail(
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

        <p className={styles.commodity}>{dict.schedule.kickoffNote}</p>

        {/*
          Played matches, folded. The drawer's tally is the whole point of the
          fold: "6 played · 4W 1D 1L" is most of what a reader wanted from the
          list, so the click is optional rather than a gamble.
        */}
        <Disclosure
          id="fixtures"
          title={dict.schedule.recent.title}
          count={
            recent.length === 0
              ? dict.schedule.recent.empty
              : dict.schedule.recent.count(recent.length, w, draws, l)
          }
          lede={dict.schedule.recent.lede}
        >
          <div className={styles.results}>
            {recent.map((fixture) => {
              const result = outcome(fixture);
              return (
                <div className={styles.row} key={fixture.id}>
                  <span className={styles.date}>
                    {formatShortDate(locale, fixture.kickoff)}
                  </span>
                  <div className={styles.middle}>
                    <div>
                      <span className={styles.resultOpponent}>
                        {fixture.opponent}
                      </span>
                      <span className={styles.venue}>
                        {fixture.venue === "home"
                          ? dict.schedule.home
                          : dict.schedule.away}
                      </span>
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
          </div>
        </Disclosure>
      </div>
    </Section>
  );
}
