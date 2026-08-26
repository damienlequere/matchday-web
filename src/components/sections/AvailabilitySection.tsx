import type { AvailabilitySummary } from "@/lib/availability";
import type { AbsenceReason } from "@/types/club";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/sections/Section";
import { formatPercent } from "@/lib/format";

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

const REASON_LABEL: Record<AbsenceReason, string> = {
  suspension: "Suspension",
  injury: "Injury",
  international: "International duty",
  other: "Other",
};

const REASON_CLASS: Record<AbsenceReason, string | undefined> = {
  suspension: styles.suspension,
  injury: styles.injury,
  international: styles.international,
  other: styles.other,
};

export function AvailabilitySection({
  availability,
}: {
  availability: AvailabilitySummary;
}) {
  return (
    <Section
      id="availability"
      title="Availability history"
      lede="Matches missed so far this season and why. Derived from team sheets already on record — this is history, not a prediction of who returns when."
    >
      <div className={styles.wrapper}>
        <Card>
          <p className={styles.blockTitle}>Matches missed by player</p>
          {availability.rows.length === 0 ? (
            <p>Nobody has missed a match this season.</p>
          ) : (
            availability.rows.map((row) => (
              <div className={styles.row} key={row.stint.playerSlug}>
                <div>
                  <div className={styles.player}>{row.stint.playerName}</div>
                  <div className={styles.reasons}>
                    {REASONS.filter((r) => row.byReason[r] > 0)
                      .map((r) => `${row.byReason[r]} ${REASON_LABEL[r].toLowerCase()}`)
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
                    {formatPercent(row.missedShare)}
                  </span>
                </div>
              </div>
            ))
          )}
        </Card>

        <Card>
          <p className={styles.blockTitle}>Season total</p>
          <p>
            <strong>{availability.totalMissed}</strong> player-matches lost,{" "}
            <strong>{availability.missedToSuspension}</strong> of them to
            suspension.
          </p>
          <div className={styles.legend}>
            {REASONS.map((reason) => (
              <span className={styles.key} key={reason}>
                <span className={`${styles.swatch} ${REASON_CLASS[reason]}`} />
                {REASON_LABEL[reason]}
              </span>
            ))}
          </div>
          <p className={styles.note}>
            Time lost to suspension is the avoidable share — and the only one
            this hub can predict, because a ban follows a rule while a recovery
            does not.
          </p>
        </Card>
      </div>
    </Section>
  );
}
