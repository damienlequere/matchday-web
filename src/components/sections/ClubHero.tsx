import type { CSSProperties } from "react";

import type { ClubIdentity } from "@/types/club";
import { Crest } from "@/components/ui/Crest";
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
 *
 * The band belongs to the club twice over, and both times cheaply: the mark at
 * its left, and a rule in the club's own colour along its bottom edge. Neither
 * costs a row. The alternative considered was a stadium photograph behind the
 * text, and it was declined on the same argument that emptied the band of
 * figures — it would spend the page's best space on atmosphere and push the
 * first real number below the fold. It would also borrow the visual grammar of
 * the sites this one is not: a page whose claim is a defensible number should
 * read as an instrument, and the photograph is the part of that claim nobody
 * can check.
 */
export function ClubHero({
  identity,
  updatedAt,
  dict,
  locale,
}: ClubHeroProps) {
  return (
    <header
      className={styles.hero}
      style={{ "--club": identity.colors.primary } as CSSProperties}
    >
      <div className="wrap">
        <div className={styles.top}>
          <div className={styles.headline}>
            <Crest identity={identity} size="lg" />
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
