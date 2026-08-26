import type { Club, Position } from "@/types/club";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/sections/Section";
import { Source } from "@/components/ui/Provenance";

import styles from "./IdentitySection.module.css";

/**
 * Club identity: honours, records, squad.
 *
 * The note is careful about what this block is for. It builds *trust*, not
 * traffic — "nothing to differentiate here". It sits below the calculable
 * blocks for exactly that reason: expecting acquisition from evergreen content
 * is how months get spent building what brings nobody.
 */

const POSITION_ORDER: Position[] = ["GK", "DF", "MF", "FW"];

const POSITION_LABEL: Record<Position, string> = {
  GK: "Goalkeepers",
  DF: "Defenders",
  MF: "Midfielders",
  FW: "Forwards",
};

export function IdentitySection({ club }: { club: Club }) {
  const honours = [...club.honours].sort((a, b) => b.count - a.count);
  const squad = club.squad.filter((s) => s.until === null);

  return (
    <Section
      id="identity"
      title="Club identity"
      lede="Honours, records and the current squad. Stable ground rather than a reason to come back — the blocks above are that."
    >
      <div className={styles.grid}>
        <Card>
          <p className={styles.blockTitle}>Honours</p>
          {honours.map((honour) => (
            <div className={styles.honour} key={honour.label}>
              <div>
                <div className={styles.honourName}>{honour.label}</div>
                <div className={styles.years}>
                  {honour.years.slice(0, 6).join(" · ")}
                  {honour.years.length > 6 ? " …" : ""}
                </div>
              </div>
              <div
                className={[
                  styles.count,
                  honour.tier === "continental" ? styles.continental : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {honour.count}
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <p className={styles.blockTitle}>Records</p>
          {club.records.map((record) => (
            <div className={styles.record} key={record.label}>
              <div className={styles.recordLabel}>{record.label}</div>
              <div className={styles.recordValue}>{record.value}</div>
              {record.detail ? (
                <div className={styles.recordDetail}>{record.detail}</div>
              ) : null}
              <div className={styles.recordSource}>
                <Source source={record.source} />
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <p className={styles.blockTitle}>Squad ({squad.length})</p>
          {POSITION_ORDER.map((position) => {
            const players = squad
              .filter((s) => s.position === position)
              .sort((a, b) => (a.shirtNumber ?? 99) - (b.shirtNumber ?? 99));
            if (players.length === 0) return null;

            return (
              <div className={styles.squadGroup} key={position}>
                <p className={styles.pos}>{POSITION_LABEL[position]}</p>
                {players.map((player) => (
                  <div className={styles.player} key={player.playerSlug}>
                    <span className={styles.shirt}>
                      {player.shirtNumber ?? "—"}
                    </span>
                    <span>{player.playerName}</span>
                    <span className={styles.nation}>{player.nationality}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </Card>
      </div>
    </Section>
  );
}
