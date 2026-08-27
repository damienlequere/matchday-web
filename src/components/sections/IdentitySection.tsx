import type { Club, Position } from "@/types/club";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/sections/Section";
import { Source } from "@/components/ui/Provenance";
import type { Dictionary } from "@/i18n";
import { translateData } from "@/i18n";

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

export function IdentitySection({
  club,
  dict,
}: {
  club: Club;
  dict: Dictionary;
}) {
  const honours = [...club.honours].sort((a, b) => b.count - a.count);
  const squad = club.squad.filter((s) => s.until === null);

  return (
    <Section
      id="identity"
      title={dict.identity.title}
      lede={dict.identity.lede}
    >
      <div className={styles.grid}>
        <Card>
          <p className={styles.blockTitle}>{dict.identity.honours}</p>
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
          <p className={styles.blockTitle}>{dict.identity.records}</p>
          {club.records.map((record) => (
            <div className={styles.record} key={record.label}>
              <div className={styles.recordLabel}>
                {translateData(dict.data.recordLabel, record.label)}
              </div>
              <div className={styles.recordValue}>{record.value}</div>
              {record.detail ? (
                <div className={styles.recordDetail}>{record.detail}</div>
              ) : null}
              <div className={styles.recordSource}>
                <Source source={record.source} dict={dict} />
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <p className={styles.blockTitle}>{dict.identity.squad(squad.length)}</p>
          {POSITION_ORDER.map((position) => {
            const players = squad
              .filter((s) => s.position === position)
              .sort((a, b) => (a.shirtNumber ?? 99) - (b.shirtNumber ?? 99));
            if (players.length === 0) return null;

            return (
              <div className={styles.squadGroup} key={position}>
                <p className={styles.pos}>{dict.identity.position[position]}</p>
                {players.map((player) => (
                  <div className={styles.player} key={player.playerSlug}>
                    <span className={styles.shirt}>
                      {player.shirtNumber ?? "—"}
                    </span>
                    <span>{player.playerName}</span>
                    <span className={styles.nation}>
                      {translateData(dict.data.nationality, player.nationality)}
                    </span>
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
