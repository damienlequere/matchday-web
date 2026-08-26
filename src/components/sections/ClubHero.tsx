import type { ClubIdentity } from "@/types/club";
import { formatLongDate, formatNumber } from "@/lib/format";

import styles from "./ClubHero.module.css";

export interface HeroStat {
  label: string;
  value: string;
  note: string;
  tone?: "alert" | "warn";
}

interface ClubHeroProps {
  identity: ClubIdentity;
  updatedAt: string;
  stats: HeroStat[];
}

/**
 * The hub's opening screen.
 *
 * It leads on the calculable figures — who is suspended, who is one card away,
 * how heavy the next fortnight is — rather than on identity. That ordering is
 * the note's central argument: opening on the costly, copyable blocks spends
 * the page's best space on what everyone else already publishes.
 */
export function ClubHero({ identity, updatedAt, stats }: ClubHeroProps) {
  return (
    <header className={styles.hero}>
      <div className="wrap">
        <div className={styles.top}>
          <div className={styles.headline}>
            <div
              className={styles.crest}
              style={{ background: identity.colors.primary }}
              aria-hidden="true"
            >
              {identity.shortName}
            </div>
            <div>
              <h1 className={styles.name}>{identity.name}</h1>
              <p className={styles.meta}>
                {identity.competition} · {identity.stadium} ·{" "}
                {formatNumber(identity.stadiumCapacity)} seats · founded{" "}
                {identity.founded}
              </p>
            </div>
          </div>
          <p className={styles.updated}>
            Updated
            <br />
            {formatLongDate(updatedAt)}
          </p>
        </div>

        <div className={styles.stats}>
          {stats.map((stat) => (
            <div className={styles.stat} key={stat.label}>
              <div className={styles.statLabel}>{stat.label}</div>
              <div
                className={[
                  styles.statValue,
                  stat.tone === "alert" ? styles.alert : "",
                  stat.tone === "warn" ? styles.warnValue : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {stat.value}
              </div>
              <div className={styles.statNote}>{stat.note}</div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
