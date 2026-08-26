import styles from "./SectionHeader.module.css";

interface SectionHeaderProps {
  title: string;
  lede?: string;
}

export function SectionHeader({ title, lede }: SectionHeaderProps) {
  return (
    <>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
      </div>
      {lede ? <p className={styles.lede}>{lede}</p> : null}
    </>
  );
}
