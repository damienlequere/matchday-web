import type { Confidence, Known, SourceRef } from "@/types/club";
import { isFact } from "@/types/club";

import styles from "./Provenance.module.css";

/**
 * Provenance, rendered per datum.
 *
 * The design note treats this as a modelling decision rather than a UI flourish:
 * a source cited per block cannot localise an error, a source cited per value
 * can. These components exist so that rule survives contact with the page.
 */

export function Source({ source }: { source: SourceRef }) {
  return (
    <span className={styles.source}>
      {source.url ? (
        <a href={source.url} rel="nofollow noopener" target="_blank">
          {source.label}
        </a>
      ) : (
        <span>{source.label}</span>
      )}
      <span aria-hidden="true">·</span>
      <span>{source.observedAt}</span>
    </span>
  );
}

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  official: "Official",
  reported: "Reported",
  derived: "Derived",
  estimated: "Estimated",
};

export function ConfidenceTag({ level }: { level: Confidence }) {
  return (
    <span className={`${styles.confidence} ${styles[level]}`}>
      {CONFIDENCE_LABEL[level]}
    </span>
  );
}

/**
 * Renders a value together with what is known about how it was obtained.
 *
 * A fact prints plainly. An inference is underlined and tagged, because a page
 * that renders a judgement in the voice of a record lies by omission.
 */
export function KnownValue<T extends React.ReactNode>({ datum }: { datum: Known<T> }) {
  if (isFact(datum)) {
    return (
      <span>
        {datum.value} <Source source={datum.source} />
      </span>
    );
  }

  return (
    <span>
      <span className={styles.inferred} title={datum.rationale}>
        {datum.value}
      </span>{" "}
      <ConfidenceTag level={datum.confidence} />
      <Source source={datum.source} />
    </span>
  );
}
