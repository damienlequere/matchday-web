import styles from "./SectionHeader.module.css";

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className={styles.head}>
      <h2 className={styles.title}>{title}</h2>
    </div>
  );
}
