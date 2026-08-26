import styles from "./JumpNav.module.css";

export interface JumpLink {
  id: string;
  label: string;
}

export function JumpNav({ links }: { links: JumpLink[] }) {
  return (
    <nav className={styles.nav} aria-label="Hub sections">
      <div className="wrap">
        <ul>
          {links.map((link) => (
            <li key={link.id}>
              <a href={`#${link.id}`}>{link.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
