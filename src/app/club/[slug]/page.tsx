import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AvailabilitySection } from "@/components/sections/AvailabilitySection";
import { ClubHero, type HeroStat } from "@/components/sections/ClubHero";
import { CongestionSection } from "@/components/sections/CongestionSection";
import { ContractsSection } from "@/components/sections/ContractsSection";
import { FixturesSection } from "@/components/sections/FixturesSection";
import { IdentitySection } from "@/components/sections/IdentitySection";
import { JumpNav } from "@/components/sections/JumpNav";
import { SuspensionsSection } from "@/components/sections/SuspensionsSection";
import { computeAvailability } from "@/lib/availability";
import { computeCongestion } from "@/lib/congestion";
import { computeContracts } from "@/lib/contracts";
import {
  computeDiscipline,
  playedFixtures,
  summariseDiscipline,
  upcomingFixtures,
} from "@/lib/discipline";
import { getClub, listClubSlugs } from "@/lib/clubs";
import { formatMatches, formatNumber } from "@/lib/format";

/**
 * The club hub.
 *
 * Section order is the note's hierarchy, not the reader's curiosity: the
 * calculable blocks first because they are defensible and free to keep fresh,
 * identity afterwards because it builds trust rather than traffic, fixtures
 * last because they are commodity.
 */

export async function generateStaticParams() {
  const slugs = await listClubSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const club = await getClub(slug);
  if (!club) return { title: "Club not found" };

  return {
    title: club.identity.name,
    description: `${club.identity.name}: suspensions, card accumulation, fixture congestion and contract expiries in one place.`,
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

const LINKS = [
  { id: "suspensions", label: "Suspensions" },
  { id: "congestion", label: "Congestion" },
  { id: "contracts", label: "Contracts" },
  { id: "availability", label: "Availability" },
  { id: "identity", label: "Identity" },
  { id: "fixtures", label: "Fixtures" },
];

export default async function ClubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const club = await getClub(slug);
  if (!club) notFound();

  const discipline = computeDiscipline(club, NOW);
  const summary = summariseDiscipline(club, discipline);
  const congestion = computeCongestion(club, NOW);
  const contracts = computeContracts(club, NOW);
  const availability = computeAvailability(club, NOW);

  const upcoming = upcomingFixtures(club, NOW);
  const recent = playedFixtures(club).slice(0, 6);
  const nextFixture = upcoming[0];

  const stats: HeroStat[] = [
    {
      label: "Suspended",
      value: String(summary.suspendedCount),
      note: nextFixture
        ? `for ${nextFixture.venue === "home" ? "" : "the trip to "}${nextFixture.opponentShort}`
        : "no fixture scheduled",
      tone: summary.suspendedCount > 0 ? "alert" : undefined,
    },
    {
      label: "One card away",
      value: String(summary.atRiskCount),
      note: "from an accumulation ban",
      tone: summary.atRiskCount > 0 ? "warn" : undefined,
    },
    {
      label: "Next 6 matches",
      value: `${congestion.spanDays}d`,
      note: `${congestion.heavyWeeks} heavy ${congestion.heavyWeeks === 1 ? "week" : "weeks"}, ${formatNumber(congestion.totalTravelKm)}km`,
      tone: congestion.heavyWeeks > 0 ? "warn" : undefined,
    },
    {
      label: "Out of contract",
      value: String(contracts.expiringCount),
      note: `in June · ${formatMatches(availability.missedToSuspension)} lost to bans`,
      tone: contracts.expiringCount > 2 ? "warn" : undefined,
    },
  ];

  return (
    <main>
      <ClubHero
        identity={club.identity}
        updatedAt={club.updatedAt}
        stats={stats}
      />
      <JumpNav links={LINKS} />

      <SuspensionsSection discipline={discipline} summary={summary} />
      <CongestionSection congestion={congestion} />
      <ContractsSection contracts={contracts} />
      <AvailabilitySection availability={availability} />
      <IdentitySection club={club} />
      <FixturesSection upcoming={upcoming.slice(0, 6)} recent={recent} />
    </main>
  );
}
