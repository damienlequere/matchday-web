import type { InjuryRow, InjurySummary } from "@/lib/injuries";
import type { InjuryStage } from "@/types/club";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/sections/Section";
import { ConfidenceTag, Source } from "@/components/ui/Provenance";
import { formatDays, formatShortDate, formatLongDate } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { translateData } from "@/i18n";

import styles from "./InjurySection.module.css";

/**
 * The injury room.
 *
 * Every other section renders records. This one renders judgement, and the
 * layout exists to keep the reader aware of which is which:
 *
 *  - What is known plainly — the area, the date it started, how long it has
 *    run — sits on the left in ordinary type.
 *  - What is inferred — the return date, the matches it costs — sits apart,
 *    underlined, tagged with its confidence and carrying the reasoning that
 *    produced it in visible text rather than a tooltip.
 *  - Where sources disagree, the disagreement is printed. A block that only
 *    showed its conclusion would be worth less than one that shows the
 *    conflict it resolved, because the reader cannot audit a conclusion.
 *
 * The fixture list under each estimate is the part that is checkable: the
 * return date may be wrong, but "these are the matches before it" follows
 * from the club's own schedule.
 */

const STAGE_CLASS: Record<InjuryStage, string | undefined> = {
  out: styles.out,
  doubtful: styles.doubtful,
  returning: styles.returning,
  resolved: styles.resolved,
};

function InjuryCard({
  row,
  dict,
  locale,
}: {
  row: InjuryRow;
  dict: Dictionary;
  locale: Locale;
}) {
  const { record } = row;
  const stageLabel = dict.injuries.stage[record.stage];

  return (
    <Card as="article" className={styles.card}>
      <div className={`${styles.stageBar} ${STAGE_CLASS[record.stage]}`} />

      <div className={styles.head}>
        <div>
          <h3 className={styles.player}>{row.stint.playerName}</h3>
          <p className={styles.meta}>
            <span className={styles.pos}>{row.stint.position}</span>
            <span aria-hidden="true">·</span>
            <span>{dict.injuries.area[record.area]}</span>
          </p>
        </div>
        <span className={`${styles.stage} ${STAGE_CLASS[record.stage]}`}>
          {stageLabel}
        </span>
      </div>

      {/* Facts: what happened, and when. Rendered plainly. */}
      <dl className={styles.facts}>
        <div>
          <dt>{dict.injuries.sinceLabel}</dt>
          <dd>
            {formatLongDate(locale, record.since.value)}
            <span className={styles.elapsed}>
              {dict.injuries.daysOut(formatDays(locale, row.daysOut))}
            </span>
            <Source source={record.since.source} dict={dict} />
          </dd>
        </div>
      </dl>

      {/* Inferences: kept visually apart from the facts above. */}
      <div className={styles.estimate}>
        <div className={styles.estimateRow}>
          <span className={styles.estimateLabel}>
            {dict.injuries.expectedLabel}
          </span>
          {record.expectedReturn ? (
            <span className={styles.estimateValue}>
              <span className={styles.inferred}>
                {formatLongDate(locale, record.expectedReturn.value)}
              </span>
              <ConfidenceTag
                level={record.expectedReturn.confidence}
                dict={dict}
              />
            </span>
          ) : (
            <span className={styles.unknown}>{dict.injuries.noReturnDate}</span>
          )}
        </div>

        {record.expectedReturn ? (
          <p className={styles.rationale}>
            <span className={styles.rationaleLabel}>
              {dict.injuries.rationaleLabel}
            </span>
            {translateData(
              dict.data.injuryProse,
              record.expectedReturn.rationale,
            )}{" "}
            <Source source={record.expectedReturn.source} dict={dict} />
          </p>
        ) : (
          <p className={styles.rationale}>{dict.injuries.noReturnDetail}</p>
        )}

        {/* The checkable half: fixtures, resolved against the real schedule. */}
        {record.expectedReturn ? (
          <div className={styles.misses}>
            <span className={styles.estimateLabel}>
              {dict.injuries.missesLabel}
            </span>{" "}
            <strong>
              {row.fixturesBeforeReturn.length > 0
                ? dict.injuries.missesCount(row.fixturesBeforeReturn.length)
                : dict.injuries.missesNone}
            </strong>
            {row.fixturesBeforeReturn.length > 0 ? (
              <ul className={styles.fixtures}>
                {row.fixturesBeforeReturn.map((fixture) => (
                  <li key={fixture.id}>
                    <span className={styles.fixtureDate}>
                      {formatShortDate(locale, fixture.kickoff)}
                    </span>
                    <span className={styles.fixtureVenue}>
                      {fixture.venue === "home"
                        ? dict.fixtures.home
                        : dict.fixtures.away}
                    </span>
                    <span>{fixture.opponentShort}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* The disagreement itself, printed rather than resolved away. */}
      {record.conflicts.length > 0 ? (
        <div className={styles.conflict}>
          <span className={styles.conflictLabel}>
            {dict.injuries.conflictLabel}
          </span>
          <ul>
            {record.conflicts.map((conflict) => (
              <li key={conflict}>
                {translateData(dict.data.injuryProse, conflict)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}

export function InjurySection({
  injuries,
  dict,
  locale,
}: {
  injuries: InjurySummary;
  dict: Dictionary;
  locale: Locale;
}) {
  const counts: Array<{ value: number; label: string; tone?: string }> = [
    { value: injuries.outCount, label: dict.injuries.counts.out, tone: styles.out },
    {
      value: injuries.doubtfulCount,
      label: dict.injuries.counts.doubtful,
      tone: styles.doubtful,
    },
    {
      value: injuries.returningCount,
      label: dict.injuries.counts.returning,
      tone: styles.returning,
    },
    {
      value: injuries.conflictCount,
      label: dict.injuries.counts.conflicts,
    },
  ];

  return (
    <Section id="injuries" title={dict.injuries.title} lede={dict.injuries.lede}>
      <div className={styles.wrapper}>
        <p className={styles.caveat}>{dict.injuries.caveat}</p>

        {injuries.rows.length === 0 ? (
          <Card>
            <p>{dict.injuries.none}</p>
          </Card>
        ) : (
          <>
            <div className={styles.counts}>
              {counts.map((count) => (
                <div className={styles.countBlock} key={count.label}>
                  <div className={styles.countRow}>
                    <span className={`${styles.dot} ${count.tone ?? styles.neutral}`} />
                    <span className={styles.count}>{count.value}</span>
                  </div>
                  <div className={styles.countLabel}>{count.label}</div>
                </div>
              ))}
            </div>

            <div className={styles.grid}>
              {injuries.rows.map((row) => (
                <InjuryCard
                  key={row.record.playerSlug}
                  row={row}
                  dict={dict}
                  locale={locale}
                />
              ))}
            </div>
          </>
        )}

        <p className={styles.note}>{dict.injuries.note}</p>
      </div>
    </Section>
  );
}
