import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AvailabilitySection } from "@/components/sections/AvailabilitySection";
import { ClubHero } from "@/components/sections/ClubHero";
import { ContractsSection } from "@/components/sections/ContractsSection";
import { IdentitySection } from "@/components/sections/IdentitySection";
import { InjurySection } from "@/components/sections/InjurySection";
import { Disclosure } from "@/components/ui/Disclosure";
import { JumpNav } from "@/components/sections/JumpNav";
import { ScheduleSection } from "@/components/sections/ScheduleSection";
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
} from "@/lib/discipline";
import { getClub, listClubSlugs } from "@/lib/clubs";
import { isLocale, LOCALES, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";

/**
 * The club hub.
 *
 * Section order is the note's hierarchy, not the reader's curiosity: squad
 * status first because it is the question a reader actually arrives with and a
 * summary placed after what it summarises is only a repetition, then the
 * calculable blocks because they are defensible and free to keep fresh, and
 * identity last because it builds trust rather than traffic.
 *
 * The fixture list is no longer a block of its own. It was printing the same
 * six upcoming matches the congestion table already priced, which made the one
 * genuinely commodity section on the page also a duplicate one. Schedule now
 * carries both — the list and what it costs — and keeps congestion's slot,
 * because a fixture list where every row is priced is not commodity. Played
 * results, the one part with no congestion figure to carry, fold into a drawer
 * inside it.
 *
 * Suspensions and the injury room are folded into squad status rather than
 * printed after it. They are its two sources, and leaving them open meant a
 * reader had to scroll past both to reach anything else — the summary saved
 * nobody any work. Folded, they stay one click and one `Ctrl+F` away, because
 * a closed `<details>` keeps its contents in the document.
 *
 * The header carries no figures. It used to open on four — suspended, one card
 * away, the next six matches, contracts expiring — on the argument that the
 * calculable blocks deserve the page's best space. They do; but each of those
 * four was the headline of a section below, so the band was spending that space
 * on a preview rather than on the thing. Every figure now appears once, in the
 * block that shows its working.
 *
 * Availability history stays a section of its own. It looks adjacent, but it
 * answers a different question — who misses matches across a season, not who
 * is missing on Sunday — and filing a season-long record behind a next-fixture
 * summary would misfile it.
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

/**
 * Section ids are stable anchors; only their labels are translated.
 *
 * One entry per section the reader can actually scroll to. Suspensions, the
 * injury room and recent results are deliberately absent: each is folded into
 * a drawer, so listing them would spend extra entries on a destination already
 * in the menu and would promise a jump where the page performs an unfold.
 * Their `#suspensions`, `#injuries` and `#fixtures` anchors still resolve —
 * `Disclosure` opens the targeted drawer — so links already in the wild keep
 * working; what is removed is the menu entry, not the destination.
 */
function jumpLinks(d: ReturnType<typeof getDictionary>) {
  return [
    { id: "squad-status", label: d.nav.squadStatus },
    { id: "congestion", label: d.nav.schedule },
    { id: "contracts", label: d.nav.contracts },
    { id: "availability", label: d.nav.availability },
    { id: "identity", label: d.nav.identity },
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
    congestion,
    NOW,
  );

  const recent = playedFixtures(club).slice(0, 6);

  return (
    <main>
      <ClubHero
        identity={club.identity}
        updatedAt={club.updatedAt}
        dict={d}
        locale={typed}
      />
      <JumpNav links={jumpLinks(d)} dict={d} />

      <SquadStatusSection
        status={squadStatus}
        dict={d}
        locale={typed}
        sources={
          <>
            <Disclosure
              id="suspensions"
              title={d.suspensions.title}
              count={
                summary.suspendedCount + summary.atRiskCount === 0
                  ? d.squadStatus.sources.empty
                  : d.squadStatus.sources.suspensionsCount(
                      summary.suspendedCount,
                      summary.atRiskCount,
                    )
              }
              lede={d.suspensions.lede}
              /*
               * Shut by default, including when players are banned.
               *
               * "Somebody is suspended" is the normal state of a squad — every
               * club in the set trips it — so opening on it would leave the
               * page exactly as long as it was before, which is the problem
               * the fold exists to solve. Squad status already prints the
               * count and the names; the drawer holds the working, and the
               * reader asks for the working when they want it.
               */
              defaultOpen={false}
            >
              <SuspensionsSection
                discipline={discipline}
                summary={summary}
                dict={d}
                locale={typed}
                nested
              />
            </Disclosure>

            <Disclosure
              id="injuries"
              title={d.injuries.title}
              count={
                injuries.rows.length === 0
                  ? d.squadStatus.sources.empty
                  : d.squadStatus.sources.injuriesCount(
                      injuries.rows.length,
                      injuries.outCount,
                    )
              }
              lede={d.injuries.lede}
              /*
               * Closed on arrival, like its neighbour — even when sources
               * disagree about a return date. The summary above already
               * carries the conclusion; a page that unfolds itself decides
               * for the reader what deserves their attention.
               */
              defaultOpen={false}
            >
              <InjurySection
                injuries={injuries}
                dict={d}
                locale={typed}
                nested
              />
            </Disclosure>
          </>
        }
      />
      <ScheduleSection
        congestion={congestion}
        recent={recent}
        dict={d}
        locale={typed}
      />
      <ContractsSection contracts={contracts} dict={d} locale={typed} />
      <AvailabilitySection
        availability={availability}
        dict={d}
        locale={typed}
      />
      <IdentitySection club={club} dict={d} />
    </main>
  );
}
