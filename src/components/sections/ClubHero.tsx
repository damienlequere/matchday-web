import type { ClubIdentity } from "@/types/club";
import { formatLongDate, formatNumber } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

import styles from "./ClubHero.module.css";

interface ClubHeroProps {
  identity: ClubIdentity;
  updatedAt: string;
  dict: Dictionary;
  locale: Locale;
}

/**
 * The hub's opening screen — identity and freshness, and nothing else.
 *
 * It used to carry four computed figures: suspended, one card away, the next
 * six matches, contracts expiring. Every one of them was already printed, in
 * fuller form, by the section that owns it — squad status, schedule, contracts.
 * Repeating them here cost the page's best space to say a thing twice, and the
 * header said it first, stripped of the context that makes it mean anything:
 * a bare "2 suspended" above the fold pre-empts a block whose whole argument is
 * that certain absences and matchday calls are not the same number.
 *
 * So the figures live where their working lives. What stays is what no section
 * below repeats — whose page this is, and how fresh it is — and the reader
 * reaches the first real figure a screen sooner.
 */
export function ClubHero({
  identity,
  updatedAt,
  dict,
  locale,
}: ClubHeroProps) {
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
                {identity.competition} ·{" "}
                {dict.hero.meta(
                  identity.stadium,
                  formatNumber(locale, identity.stadiumCapacity),
                  identity.founded,
                )}
              </p>
            </div>
          </div>
          <p className={styles.updated}>
            {dict.hero.updated}
            <br />
            {formatLongDate(locale, updatedAt)}
          </p>
        </div>
      </div>
    </header>
  );
}
