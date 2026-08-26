import type { ReactNode } from "react";

import styles from "./Card.module.css";

interface CardProps {
  children: ReactNode;
  /** Applies standard padding. Disable for full-bleed content (table, list). */
  padded?: boolean;
  className?: string;
  as?: "div" | "article" | "section" | "li";
}

export function Card({ children, padded = true, className, as: Tag = "div" }: CardProps) {
  return (
    <Tag className={[styles.card, padded ? styles.padded : "", className].filter(Boolean).join(" ")}>
      {children}
    </Tag>
  );
}
