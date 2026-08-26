import type { ReactNode } from "react";

import { SectionHeader } from "@/components/ui/SectionHeader";

import styles from "./Section.module.css";

interface SectionProps {
  id: string;
  title: string;
  lede?: string;
  children: ReactNode;
}

export function Section({ id, title, lede, children }: SectionProps) {
  return (
    <section id={id} className={styles.section}>
      <div className="wrap">
        <SectionHeader title={title} lede={lede} />
        {children}
      </div>
    </section>
  );
}
