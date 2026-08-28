import type { ReactNode } from "react";

import styles from "./Disclosure.module.css";

/**
 * A collapsed source block, folded under the summary that reads it.
 *
 * Built on native `<details>` rather than state, and the choice is not about
 * saving a hook. A closed `<details>` keeps its contents in the DOM, so the
 * block stays indexable, printable, and reachable by the browser's own find —
 * a reader who searches a player's name still lands on it. A JS-gated panel
 * would trade three sections of public content for an animation.
 *
 * The summary carries a count because a drawer whose contents are unknown is
 * a worse offer than the open block it replaced. "Suspensions" asks the reader
 * to gamble a click; "Suspensions — 3 concerned" lets them decide.
 */
export function Disclosure({
  id,
  title,
  count,
  defaultOpen = false,
  children,
}: {
  id: string;
  title: string;
  /** Short, already-formatted tally shown beside the title. */
  count: string;
  /**
   * Open on load.
   *
   * Reserved for a drawer that bears on the next fixture: a squad with players
   * banned or ruled out should not have to be asked. An empty drawer stays
   * shut, so a closed row means "nothing to report" rather than "not looked at".
   */
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details id={id} className={styles.details} open={defaultOpen || undefined}>
      <summary className={styles.summary}>
        {/* Decorative: `summary` already exposes its own expanded state. */}
        <span className={styles.marker} aria-hidden="true" />
        <span className={styles.title}>{title}</span>
        <span className={styles.count}>{count}</span>
      </summary>
      <div className={styles.body}>{children}</div>
    </details>
  );
}
