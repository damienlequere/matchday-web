import type { Dictionary } from "@/i18n";

import styles from "./DemoBanner.module.css";

/**
 * Says plainly that the dataset is invented.
 *
 * A hub is judged on its most stale block, and a demo that looks live invites
 * exactly the trust it has not earned. Stating it once, at the top, costs
 * nothing and keeps the rest of the page honest.
 */
export function DemoBanner({ dict }: { dict: Dictionary }) {
  return (
    <div className={styles.banner}>
      <div className={`wrap ${styles.inner}`}>
        <span className={styles.tag}>{dict.banner.tag}</span>
        <span>{dict.banner.body}</span>
      </div>
    </div>
  );
}
