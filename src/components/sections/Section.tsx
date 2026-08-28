import type { ReactNode } from "react";

import { SectionHeader } from "@/components/ui/SectionHeader";

import styles from "./Section.module.css";

interface SectionProps {
  id: string;
  title: string;
  /**
   * Render the contents alone, without the band, the width wrapper or the
   * heading.
   *
   * Set when the block has been folded into another section's drawer: the
   * drawer's own summary already carries the title, and the enclosing section
   * already supplies the wrap. Kept as a flag on `Section` rather than as a
   * second export per block so a folded block and a standalone one stay one
   * component with one code path.
   */
  nested?: boolean;
  children: ReactNode;
}

export function Section({ id, title, nested, children }: SectionProps) {
  if (nested) return <>{children}</>;

  return (
    <section id={id} className={styles.section}>
      <div className="wrap">
        <SectionHeader title={title} />
        {children}
      </div>
    </section>
  );
}
