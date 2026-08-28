import Link from "next/link";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

import styles from "./HomeLink.module.css";

/**
 * The way back to the index, from a club page.
 *
 * A club hub is a bookmarked address as often as it is a click from the index,
 * so a reader can arrive here with no history to go back through. The browser's
 * back button is not that route; this is.
 *
 * Icon and words together, rather than the icon alone. A bare house is a
 * convention borrowed from apps whose home screen is the whole product, and
 * this site's index is a specific thing — the list of clubs — which two words
 * name and a glyph only gestures at. The words also spare the link the usual
 * icon-only apologies: no tooltip, no `aria-label` standing in for a label the
 * page could simply have printed. The mark stays decorative, so screen readers
 * announce the text once.
 *
 * The chevron is drawn inline rather than pulled from an icon set. It is the
 * only icon on the site; a dependency for twelve bytes of path data would cost
 * more to keep current than to draw, and inline it inherits `currentColor` and
 * therefore the band's hover states for free.
 */
export function HomeLink({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <Link href={`/${locale}`} className={styles.link}>
      <svg
        className={styles.icon}
        viewBox="0 0 16 16"
        width="12"
        height="12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M10 3 5 8l5 5" />
      </svg>
      {dict.hero.home}
    </Link>
  );
}
