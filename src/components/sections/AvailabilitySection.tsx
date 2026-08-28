import type { AvailabilitySummary } from "@/lib/availability";
import type { AbsenceReason } from "@/types/club";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/sections/Section";
import { formatPercent } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

import styles from "./AvailabilitySection.module.css";

/**
 * Availability history.
 *
 * Strictly what already happened. The prospective half — "back in two weeks" —
 * is an inference over contradictory sources and is deliberately absent from
 * this build; publishing it would mean shipping judgement without the pipeline
 * to check it.
 */

const REASONS: AbsenceReason[] = ["suspension", "injury", "international", "other"];

const REASON_CLASS: Record<AbsenceReason, string | undefined> = {
  suspension: styles.suspension,
  injury: styles.injury,
  international: styles.international,
  other: styles.other,
};

export function AvailabilitySection({
  availability,
  dict,
  locale,
}: {
  availability: AvailabilitySummary;
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <Section
      id="availability"
      title={dict.availability.title}
    >
      <div className={styles.wrapper}>
        <Card>
          <p className={styles.blockTitle}>{dict.availability.byPlayer}</p>
          {availability.rows.length === 0 ? (
            <p>{dict.availability.noneMissed}</p>
          ) : (
            availability.rows.map((row) => (
              <div className={styles.row} key={row.stint.playerSlug}>
                <div>
                  <div className={styles.player}>{row.stint.playerName}</div>
                  <div className={styles.reasons}>
                    {REASONS.filter((r) => row.byReason[r] > 0)
                      .map(
                        (r) =>
                          `${row.byReason[r]} ${dict.availability.reasonInline[r]}`,
                      )
                      .join(" · ")}
                  </div>
                </div>
                <div className={styles.track}>
                  {REASONS.map((reason) =>
                    row.byReason[reason] > 0 ? (
                      <span
                        key={reason}
                        className={`${styles.seg} ${REASON_CLASS[reason]}`}
                        style={{
                          width: `${(row.byReason[reason] / row.missed) * 100}%`,
                        }}
                      />
                    ) : null,
                  )}
                </div>
                <div className={styles.count}>
                  {row.missed}
                  <br />
                  <span className={styles.share}>
                    {formatPercent(locale, row.missedShare)}
                  </span>
                </div>
              </div>
            ))
          )}
        </Card>

        <Card>
          <p className={styles.blockTitle}>{dict.availability.seasonTotal}</p>
          <p>
            <strong>{availability.totalMissed}</strong>
            {dict.availability.totalSentence.middle}
            <strong>{availability.missedToSuspension}</strong>
            {dict.availability.totalSentence.after}
          </p>
          <div className={styles.legend}>
            {REASONS.map((reason) => (
              <span className={styles.key} key={reason}>
                <span className={`${styles.swatch} ${REASON_CLASS[reason]}`} />
                {dict.availability.reason[reason]}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </Section>
  );
}
