import styles from "./Pill.module.css";

export type PillTone = "ok" | "warn" | "crit";

interface PillProps {
  tone: PillTone;
  children: React.ReactNode;
}

/**
 * A status colour never travels alone: every pill carries a glyph and a label,
 * so it stays readable with colour-vision deficiency and in black-and-white
 * print.
 */
const GLYPH: Record<PillTone, string> = {
  ok: "✓",
  warn: "!",
  crit: "×",
};

export function Pill({ tone, children }: PillProps) {
  return (
    <span className={`${styles.pill} ${styles[tone]}`}>
      <span className={styles.glyph} aria-hidden="true">
        {GLYPH[tone]}
      </span>
      {children}
    </span>
  );
}
