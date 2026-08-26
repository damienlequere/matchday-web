import type { ReactNode } from "react";

import styles from "./DataList.module.css";

export interface DataListRow {
  term: string;
  value: ReactNode;
  /** Optional tint applied to the value (status, alert). */
  tone?: "ok" | "warn" | "crit";
}

interface DataListProps {
  rows: DataListRow[];
  className?: string;
}

export function DataList({ rows, className }: DataListProps) {
  return (
    <dl className={[styles.list, className].filter(Boolean).join(" ")}>
      {rows.map((row) => (
        <div className={styles.row} key={row.term}>
          <dt className={styles.term}>{row.term}</dt>
          <dd className={[styles.value, row.tone ? styles[row.tone] : ""].filter(Boolean).join(" ")}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
