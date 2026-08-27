import Link from "next/link";

import { LOCALES, LOCALE_NAME, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

import styles from "./LocaleSwitcher.module.css";

/**
 * Language switcher.
 *
 * Plain links rather than a select, so it works without JavaScript and each
 * locale keeps a crawlable URL. It links to the locale root rather than the
 * translated equivalent of the current page: a server component cannot read
 * the pathname, and threading it through every page to save one click is not
 * worth the coupling.
 */
export function LocaleSwitcher({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <nav className={styles.switcher} aria-label={dict.localeSwitcher.label}>
      {LOCALES.map((option) =>
        option === locale ? (
          <span key={option} className={styles.current} aria-current="true">
            {LOCALE_NAME[option]}
          </span>
        ) : (
          <Link key={option} href={`/${option}`} className={styles.link}>
            {LOCALE_NAME[option]}
          </Link>
        ),
      )}
    </nav>
  );
}
