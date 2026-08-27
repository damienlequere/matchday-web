import Image from "next/image";

import type { ClubIdentity } from "@/types/club";

import styles from "./Crest.module.css";

export type CrestSize = "sm" | "lg";

interface CrestProps {
  identity: ClubIdentity;
  size: CrestSize;
}

/** Rendered box in pixels, kept here so `next/image` and the CSS cannot drift. */
const PX: Record<CrestSize, number> = {
  sm: 40,
  lg: 58,
};

/**
 * A club's mark: its crest where one is licensed, its initials where none is.
 *
 * Two call sites rendered this square independently — the hero and the club
 * cards on the index — which meant the fallback existed twice and a real crest
 * would have had to be introduced twice. It is one component now, sized by
 * role rather than by pixels.
 *
 * The initials branch is not a placeholder awaiting an asset. Crests are
 * trademarks, and this project ships none, so the coloured square is the state
 * the page is actually in — built to look deliberate rather than pending. The
 * club's own colour carries the recognition instead, which is the same job
 * `colors.primary` already does everywhere else on the page.
 *
 * Decorative in both branches: the club's name is printed beside it at every
 * call site, so announcing the mark would read the name twice.
 */
export function Crest({ identity, size }: CrestProps) {
  const px = PX[size];

  if (identity.crest) {
    return (
      <Image
        className={`${styles.crest} ${styles[size]} ${styles.image}`}
        src={identity.crest}
        alt=""
        width={px}
        height={px}
        aria-hidden="true"
      />
    );
  }

  return (
    <span
      className={`${styles.crest} ${styles[size]} ${styles.initials}`}
      style={{ background: identity.colors.primary }}
      aria-hidden="true"
    >
      {identity.shortName}
    </span>
  );
}
