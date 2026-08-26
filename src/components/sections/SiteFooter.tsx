import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.cols}`}>
        <p>
          <b>Matchday &mdash; club hub prototype.</b>
          <br />
          One address instead of six. This build ships the calculable layer —
          suspensions, fixture congestion, contract expiries and availability
          history — plus club identity. No affiliation with any club, league or
          federation.
        </p>
        <p className={styles.right}>
          All figures are demonstration data.
          <br />
          Calculable blocks are computed, never stored.
        </p>
      </div>
    </footer>
  );
}
