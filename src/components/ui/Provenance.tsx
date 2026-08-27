import type { Confidence, Known, SourceRef } from "@/types/club";
import { isFact } from "@/types/club";
import type { Dictionary } from "@/i18n";
import { translateData } from "@/i18n";

import styles from "./Provenance.module.css";

/**
 * Provenance, rendered per datum.
 *
 * The design note treats this as a modelling decision rather than a UI flourish:
 * a source cited per block cannot localise an error, a source cited per value
 * can. These components exist so that rule survives contact with the page.
 */

export function Source({
  source,
  dict,
}: {
  source: SourceRef;
  dict: Dictionary;
}) {
  // Source labels arrive inside the club data; unmapped ones show as-is.
  const label = translateData(dict.data.sourceLabel, source.label);

  return (
    <span className={styles.source}>
      {source.url ? (
        <a href={source.url} rel="nofollow noopener" target="_blank">
          {label}
        </a>
      ) : (
        <span>{label}</span>
      )}
      <span aria-hidden="true">·</span>
      <span>{source.observedAt}</span>
    </span>
  );
}

export function ConfidenceTag({
  level,
  dict,
}: {
  level: Confidence;
  dict: Dictionary;
}) {
  return (
    <span className={`${styles.confidence} ${styles[level]}`}>
      {dict.provenance.confidence[level]}
    </span>
  );
}

/**
 * Renders a value together with what is known about how it was obtained.
 *
 * A fact prints plainly. An inference is underlined and tagged, because a page
 * that renders a judgement in the voice of a record lies by omission.
 */
export function KnownValue<T extends React.ReactNode>({
  datum,
  dict,
}: {
  datum: Known<T>;
  dict: Dictionary;
}) {
  if (isFact(datum)) {
    return (
      <span>
        {datum.value} <Source source={datum.source} dict={dict} />
      </span>
    );
  }

  return (
    <span>
      <span className={styles.inferred} title={datum.rationale}>
        {datum.value}
      </span>{" "}
      <ConfidenceTag level={datum.confidence} dict={dict} />
      <Source source={datum.source} dict={dict} />
    </span>
  );
}
