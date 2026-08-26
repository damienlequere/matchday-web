import Link from "next/link";

import { computeContracts } from "@/lib/contracts";
import { computeDiscipline, summariseDiscipline } from "@/lib/discipline";
import { getAllClubs } from "@/lib/clubs";

import styles from "./page.module.css";

/**
 * The index.
 *
 * A hub lives on direct visits and bookmarks rather than search, so the small
 * number of clubs is an asset: one memorable address, and every card already
 * answers the question that brought the visitor.
 */

const NOW = new Date("2027-02-20T12:00:00Z");

export default async function HomePage() {
  const clubs = await getAllClubs();

  const cards = clubs
    .map((club) => {
      const discipline = computeDiscipline(club, NOW);
      const summary = summariseDiscipline(club, discipline);
      return {
        club,
        summary,
        contracts: computeContracts(club, NOW),
      };
    })
    .sort((a, b) => a.club.identity.name.localeCompare(b.club.identity.name));

  return (
    <main>
      <section className={styles.intro}>
        <div className="wrap">
          <h1 className={styles.wordmark}>Matchday</h1>
          <p className={styles.tagline}>
            <span className={styles.claim}>One address instead of six.</span>{" "}
            Who is suspended, who is one card away, how heavy the next fortnight
            is, and whose contract runs out in June — computed from public
            record, not collected by hand.
          </p>
        </div>
      </section>

      <section className={styles.clubs}>
        <div className="wrap">
          <h2 className="eyebrow">Clubs</h2>
          <ul className={styles.list}>
            {cards.map(({ club, summary, contracts }) => (
              <li key={club.identity.slug}>
                <Link
                  href={`/club/${club.identity.slug}`}
                  className={styles.club}
                >
                  <div className={styles.clubTop}>
                    <span
                      className={styles.crest}
                      style={{ background: club.identity.colors.primary }}
                      aria-hidden="true"
                    >
                      {club.identity.shortName}
                    </span>
                    <span>
                      <span className={styles.clubName}>
                        {club.identity.name}
                      </span>
                      <span className={styles.clubMeta}>
                        {club.identity.competition} · {club.identity.city}
                      </span>
                    </span>
                  </div>

                  <div className={styles.figures}>
                    <div>
                      <div
                        className={`${styles.figure} ${summary.suspendedCount > 0 ? styles.alert : ""}`}
                      >
                        {summary.suspendedCount}
                      </div>
                      <div className={styles.figureLabel}>Suspended</div>
                    </div>
                    <div>
                      <div
                        className={`${styles.figure} ${summary.atRiskCount > 0 ? styles.warn : ""}`}
                      >
                        {summary.atRiskCount}
                      </div>
                      <div className={styles.figureLabel}>One card away</div>
                    </div>
                    <div>
                      <div className={styles.figure}>
                        {contracts.expiringCount}
                      </div>
                      <div className={styles.figureLabel}>
                        Out of contract
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <p className={styles.note}>
            <strong>Why these blocks.</strong> Suspensions, fixture congestion
            and contract expiries are derivable from public facts, so they cost
            nothing to keep current and cannot be scooped. The injury room is
            what brings people in, but it is judgement over contradictory
            sources — it is not shipped here, because a page that states a guess
            in the voice of a record is worse than a page that stays quiet.
          </p>
        </div>
      </section>
    </main>
  );
}
