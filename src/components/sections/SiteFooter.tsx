import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

import styles from "./SiteFooter.module.css";

export function SiteFooter({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.cols}`}>
        <p>
          <b>{dict.footer.title}</b>
          <br />
          {dict.footer.body}
        </p>
        <div className={styles.right}>
          <LocaleSwitcher dict={dict} locale={locale} />
        </div>
      </div>
    </footer>
  );
}
