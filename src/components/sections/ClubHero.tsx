import type { ClubIdentity } from "@/types/club";
import { Crest } from "@/components/ui/Crest";
import { HomeLink } from "@/components/ui/HomeLink";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

import styles from "./ClubHero.module.css";

interface ClubHeroProps {
  identity: ClubIdentity;
  dict: Dictionary;
  locale: Locale;
}

/**
 * The hub's opening screen — identity, and nothing else.
 *
 * It used to carry four computed figures: suspended, one card away, the next
 * six matches, contracts expiring. Every one of them was already printed, in
 * fuller form, by the section that owns it — squad status, schedule, contracts.
 * Repeating them here cost the page's best space to say a thing twice, and the
 * header said it first, stripped of the context that makes it mean anything:
 * a bare "2 suspended" above the fold pre-empts a block whose whole argument is
 * that certain absences and matchday calls are not the same number.
 *
 * So the figures live where their working lives. What stays is whose page this
 * is, and the reader reaches the first real figure a screen sooner. A stamped
 * update date stood here too, and it went the same way for a narrower reason:
 * a date on the band dates the whole page, which is the one thing it cannot
 * honestly do — the sections beneath it are fresh on their own schedules, and
 * each already says so where a reader can act on it.
 *
 * The band belongs to the club through the mark at its left, and that is the
 * whole of it — no row spent, and no second statement of the same thing. A
 * rule in the club's own colour ran along the bottom edge here once; the mark
 * already carries the colour, so the rule was a tint the reader had no use for
 * twice. The band ends on its own change of background now, with no edge
 * drawn at all. The alternative considered was a stadium photograph behind
 * the text, and it was declined on the same argument that emptied the band of
 * figures — it would spend the page's best space on atmosphere and push the
 * first real number below the fold. It would also borrow the visual grammar of
 * the sites this one is not: a page whose claim is a defensible number should
 * read as an instrument, and the photograph is the part of that claim nobody
 * can check.
 *
 * The band also carries the way back to the index, above the name. A club page
 * is a bookmarked address as often as it is a click from the list, so the back
 * button cannot be assumed to lead anywhere; the link is one line of chrome and
 * it sits with identity because that is the question it answers — whose page
 * this is, and what it is one of.
 */
export function ClubHero({ identity, dict, locale }: ClubHeroProps) {
  return (
    <header className={styles.hero}>
      <div className="wrap">
        <div className={styles.homeLink}>
          <HomeLink dict={dict} locale={locale} />
        </div>
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
      </div>
    </header>
  );
}
