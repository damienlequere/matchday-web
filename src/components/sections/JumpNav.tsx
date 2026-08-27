import type { Dictionary } from "@/i18n";

import styles from "./JumpNav.module.css";

export interface JumpLink {
  id: string;
  label: string;
}

export function JumpNav({
  links,
  dict,
}: {
  links: JumpLink[];
  dict: Dictionary;
}) {
  return (
    <nav className={styles.nav} aria-label={dict.nav.label}>
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
