import Link from "next/link";

import { Crest } from "@/components/ui/Crest";
import { computeContracts } from "@/lib/contracts";
import { computeDiscipline, summariseDiscipline } from "@/lib/discipline";
import { getAllClubs } from "@/lib/clubs";
import { INTL_LOCALE, isLocale, LOCALES } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { notFound } from "next/navigation";

import styles from "./page.module.css";

/**
 * The index.
 *
 * A hub lives on direct visits and bookmarks rather than search, so the small
 * number of clubs is an asset: one memorable address, and every card already
 * answers the question that brought the visitor.
 */

const NOW = new Date("2027-02-20T12:00:00Z");

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const d = getDictionary(locale);
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
    .sort((a, b) =>
      a.club.identity.name.localeCompare(
        b.club.identity.name,
        INTL_LOCALE[locale],
      ),
    );

  return (
    <main>
      <section className={styles.intro}>
        <div className="wrap">
          <h1 className={styles.wordmark}>{d.meta.siteName}</h1>
          <p className={styles.tagline}>
            <span className={styles.claim}>{d.home.tagline.claim}</span>{" "}
            {d.home.tagline.rest}
          </p>
        </div>
      </section>

      <section className={styles.clubs}>
        <div className="wrap">
          <h2 className="eyebrow">{d.home.clubs}</h2>
          <ul className={styles.list}>
            {cards.map(({ club, summary, contracts }) => (
              <li key={club.identity.slug}>
                <Link
                  href={`/${locale}/club/${club.identity.slug}`}
                  className={styles.club}
                >
                  <div className={styles.clubTop}>
                    <Crest identity={club.identity} size="sm" />
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
                      <div className={styles.figureLabel}>{d.home.suspended}</div>
                    </div>
                    <div>
                      <div
                        className={`${styles.figure} ${summary.atRiskCount > 0 ? styles.warn : ""}`}
                      >
                        {summary.atRiskCount}
                      </div>
                      <div className={styles.figureLabel}>{d.home.atRisk}</div>
                    </div>
                    <div>
                      <div className={styles.figure}>
                        {contracts.expiringCount}
                      </div>
                      <div className={styles.figureLabel}>
                        {d.home.outOfContract}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <p className={styles.note}>
            <strong>{d.home.note.lead}</strong> {d.home.note.body}
          </p>
        </div>
      </section>
    </main>
  );
}
