import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AvailabilitySection } from "@/components/sections/AvailabilitySection";
import { ClubHero, type HeroStat } from "@/components/sections/ClubHero";
import { CongestionSection } from "@/components/sections/CongestionSection";
import { ContractsSection } from "@/components/sections/ContractsSection";
import { FixturesSection } from "@/components/sections/FixturesSection";
import { IdentitySection } from "@/components/sections/IdentitySection";
import { InjurySection } from "@/components/sections/InjurySection";
import { JumpNav } from "@/components/sections/JumpNav";
import { SquadStatusSection } from "@/components/sections/SquadStatusSection";
import { SuspensionsSection } from "@/components/sections/SuspensionsSection";
import { computeAvailability } from "@/lib/availability";
import { computeCongestion } from "@/lib/congestion";
import { computeContracts } from "@/lib/contracts";
import { computeInjuries } from "@/lib/injuries";
import { computeSquadStatus } from "@/lib/squad-status";
import {
  computeDiscipline,
  playedFixtures,
  summariseDiscipline,
  upcomingFixtures,
} from "@/lib/discipline";
import { getClub, listClubSlugs } from "@/lib/clubs";
import {
  formatDaysShort,
  formatHeavyWeeks,
  formatMatches,
  formatNumber,
} from "@/lib/format";
import { isLocale, LOCALES, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";

/**
 * The club hub.
 *
 * Section order is the note's hierarchy, not the reader's curiosity: squad
 * status first because it is the question a reader actually arrives with and a
 * summary placed after what it summarises is only a repetition, then the
 * calculable blocks because they are defensible and free to keep fresh,
 * identity afterwards because it builds trust rather than traffic, fixtures
 * last because they are commodity.
 */

export async function generateStaticParams() {
  const slugs = await listClubSlugs();
  // Cross product: every club is prerendered in every locale.
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const d = getDictionary(isLocale(locale) ? locale : "en");

  const club = await getClub(slug);
  if (!club) return { title: d.meta.clubNotFound };

  return {
    title: club.identity.name,
    description: d.meta.clubDescription(club.identity.name),
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `/${l}/club/${slug}`]),
      ),
    },
  };
}

/**
 * A fixed "now" for the demonstration dataset.
 *
 * A real deployment reads the clock. Pinning it here keeps the seeded season
 * coherent — mid-February, with a run of fixtures still to play — so the
 * calculable blocks always have something to show.
 */
const NOW = new Date("2027-02-20T12:00:00Z");

/** Section ids are stable anchors; only their labels are translated. */
function jumpLinks(d: ReturnType<typeof getDictionary>) {
  return [
    { id: "squad-status", label: d.nav.squadStatus },
    { id: "suspensions", label: d.nav.suspensions },
    { id: "congestion", label: d.nav.congestion },
    { id: "contracts", label: d.nav.contracts },
    { id: "availability", label: d.nav.availability },
    { id: "injuries", label: d.nav.injuries },
    { id: "identity", label: d.nav.identity },
    { id: "fixtures", label: d.nav.fixtures },
  ];
}

export default async function ClubPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const typed: Locale = locale;
  const d = getDictionary(typed);

  const club = await getClub(slug);
  if (!club) notFound();

  const discipline = computeDiscipline(club, NOW);
  const summary = summariseDiscipline(club, discipline);
  const congestion = computeCongestion(club, NOW);
  const contracts = computeContracts(club, NOW);
  const availability = computeAvailability(club, NOW);
  const injuries = computeInjuries(club, NOW);
  // Crosses the two blocks above; computed last because it consumes both.
  const squadStatus = computeSquadStatus(
    club,
    discipline,
    injuries,
    congestion.heavyWeeks,
    NOW,
  );

  const upcoming = upcomingFixtures(club, NOW);
  const recent = playedFixtures(club).slice(0, 6);
  const nextFixture = upcoming[0];

  const stats: HeroStat[] = [
    {
      label: d.hero.suspended,
      value: String(summary.suspendedCount),
      note: nextFixture
        ? d.hero.forFixture(
            nextFixture.opponentShort,
            nextFixture.venue === "home",
          )
        : d.hero.noFixture,
      tone: summary.suspendedCount > 0 ? "alert" : undefined,
    },
    {
      label: d.hero.atRisk,
      value: String(summary.atRiskCount),
      note: d.hero.atRiskNote,
      tone: summary.atRiskCount > 0 ? "warn" : undefined,
    },
    {
      label: d.hero.nextSix,
      value: formatDaysShort(typed, congestion.spanDays),
      note: d.hero.congestionNote(
        formatHeavyWeeks(typed, congestion.heavyWeeks),
        formatNumber(typed, congestion.totalTravelKm),
      ),
      tone: congestion.heavyWeeks > 0 ? "warn" : undefined,
    },
    {
      label: d.hero.outOfContract,
      value: String(contracts.expiringCount),
      note: d.hero.contractNote(
        formatMatches(typed, availability.missedToSuspension),
        availability.missedToSuspension,
      ),
      tone: contracts.expiringCount > 2 ? "warn" : undefined,
    },
  ];

  return (
    <main>
      <ClubHero
        identity={club.identity}
        updatedAt={club.updatedAt}
        stats={stats}
        dict={d}
        locale={typed}
      />
      <JumpNav links={jumpLinks(d)} dict={d} />

      <SquadStatusSection status={squadStatus} dict={d} locale={typed} />
      <SuspensionsSection
        discipline={discipline}
        summary={summary}
        dict={d}
        locale={typed}
      />
      <CongestionSection congestion={congestion} dict={d} locale={typed} />
      <ContractsSection contracts={contracts} dict={d} locale={typed} />
      <AvailabilitySection
        availability={availability}
        dict={d}
        locale={typed}
      />
      <InjurySection injuries={injuries} dict={d} locale={typed} />
      <IdentitySection club={club} dict={d} />
      <FixturesSection
        upcoming={upcoming.slice(0, 6)}
        recent={recent}
        dict={d}
        locale={typed}
      />
    </main>
  );
}
