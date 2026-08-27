# Matchday

A **club hub**: one address instead of six.

Following a club today means five X accounts for news, Transfermarkt for
transfers, Sofascore for the calendar and an article somewhere for the injury
room. Matchday is the argument that one page can replace that — and that the
page should lead with what it can compute rather than what it must collect.

This build ships the **calculable layer** plus club identity, for three clubs.

## What is here

| Block | Why it is here |
| --- | --- |
| **Suspensions & card accumulation** | The strongest asset. Public facts, indisputable, and almost nobody publishes it — no journalist gets up in the morning for it. |
| **Fixture congestion** | Everyone publishes the fixture list; nobody publishes what it costs. Rest days, three-match weeks, kilometres. |
| **Contract expiries** | Who leaves in June, who is in their final year. Never offered as a squad-wide overview. |
| **Availability history** | Matches missed this season and why — derivable from what is already stored. |
| **Club identity** | Honours, records, squad. Builds trust, not traffic. |
| **Fixtures** | Necessary, pure commodity, deliberately last. |

## What is deliberately absent

The **injury room** is the block that brings people in, and it is not here.
That is the design, not an omission: it is judgement over contradictory
sources, not extraction. "Came off injured, scans to follow" → out on Saturday?
Nobody knows, the club included. An agent will extract that confidently and be
wrong silently.

Shipping it needs the pipeline it does not yet have: per-datum sourcing,
explicit confidence, and human review before anything that commits. The types
for all three already exist (`Fact<T>`, `Inference<T>`, `SourceRef`,
`Confidence`) so the block can land without reshaping the model.

Transfers and probable line-ups are further out still — costly, saturated, and
the most fragile.

## Design rules the code enforces

- **The club is the root entity.** A squad is reconstructed by resolving dated
  `Stint` rows, never by scanning players and trusting spelling. This is what
  makes a squad-wide contract view possible at all.
- **Fact and inference are different types.** A yellow card is a `Fact<T>`; a
  prediction is an `Inference<T>` carrying a confidence level and a rationale.
  They never share a field and never render alike.
- **Provenance attaches per datum, not per block.** A source cited per section
  cannot localise an error; one cited per value can.
- **Calculable blocks are computed, never stored.** No suspension is written to
  disk — it is derived from card events against each competition's rules, so it
  cannot drift out of date relative to the facts beneath it.
- **No agents on deterministic work.** Suspensions, congestion and contracts
  are arithmetic. Putting a model there adds uncertainty to a calculation.

## Data

The dataset is **invented** — three Ligue 1 clubs, a generated 2026-27 season —
and the site says so on every page. `scripts/seed.mjs` generates it so that the
facts stay mutually consistent: a suspension absence corresponds to a card that
actually triggers a ban, and every card points at a fixture that exists.

Rendering is pinned to a fixed "now" (20 February 2027) so the season always has
fixtures left to play. A real deployment reads the clock.

## Running it

```bash
npm install
npm run dev             # http://localhost:3000
```

```bash
node scripts/seed.mjs   # regenerate the dataset
```

`npm run typecheck` · `npm run lint` · `npm run build`

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict with
`noUncheckedIndexedAccess` · CSS Modules over a token-based `globals.css` ·
self-hosted fonts via Fontsource. No CSS framework, no database, no client-side
data fetching — every page is prerendered.

The design system (tokens, primitives, dark mode) is shared with `palmares-web`.

## Structure

```
src/types/club.ts      Domain model — Club, Stint, CardEvent, Fact/Inference
src/lib/discipline.ts  Suspensions and card accumulation
src/lib/congestion.ts  Rest days, three-match weeks, travel
src/lib/contracts.ts   Expiry classification
src/lib/availability.ts Matches missed, by reason
src/lib/clubs.ts       Data access — JSON today, an HTTP client tomorrow
```

The project rule that governs all of it: **losing a provider must degrade the
product, not kill it.** With an agent backend that hardens — it is not enough to
survive a source going away, the product has to survive a source that keeps
answering while being wrong.

## Where this could become a business

Not from the fan hub. Consumer football content monetises through advertising,
which monetises through traffic, which means the injury room, transfers and
line-ups — the three blocks this build deliberately refuses. The calculable
layer is the part nobody gets up in the morning for, which is what makes it
uncontested and what makes it a poor advertising product.

The buyer is **fantasy football operators**: the companies editing games where
users field real players and score on real results — MPG (Mon Petit Gazon) and
Sorare in France, Fantasy Premier League in England, plus the white-label
providers behind media brands.

Their core loop is the user deciding who to field before each matchday, and a
suspended player scores zero. So the highest-value thing they can tell a user
is "your midfielder is one yellow from a ban, he plays Sunday" — a decision
taken days in advance, and exactly what `src/lib/discipline.ts` computes,
including the part most implementations get wrong: a ban is served in the
competition that issued it, so the next fixture is not necessarily the one
missed.

They are the right first buyer for three reasons. The question is native to
their product rather than adjacent to it; they are game studios that buy feeds
rather than build data capability, so this is an incremental line on an
existing budget; and they are small enough to reach directly, which betting
operators and clubs are not. Betting is richer and worse — Sportradar-class
contracts, integrity regulation, quarters-long procurement. Clubs are the
seductive wrong answer: twenty buyers in Ligue 1, nine-month cycles, and
congestion tooling would need validation against real injury outcomes this
build does not have.

The shape is an API rather than a site: `yellowsUntilBan`, `suspendedNow` and
the resolved fixtures, licensed yearly.

### What decides it

Not the buyer — the data licence. Ligue 1 card and fixture data comes through
the LFP or a licensed reseller, and their tiers assume betting-scale revenue.
If a non-betting derived-data licence exists at low-thousands per season, this
works. If the only route is a Sportradar-class contract, the derived product
cannot carry the cost at fantasy pricing, and the play becomes selling the
engine to someone who already holds a licence. That call comes before more
code. Worth verifying alongside it whether operators already receive
suspension flags bundled from their current provider — if so, the wedge moves
to congestion, which nobody packages.

One readiness caveat, and it is the same one the injury room raises. The
engine assumes clean, complete, consistent card data. Real feeds arrive late,
get corrected after disciplinary hearings, and disagree about whether a second
yellow was rescinded. `Fact<T>` and `Inference<T>` are the right foundation for
that reconciliation, but the pipeline is unbuilt — and an operator pushing
"banned" to a hundred thousand users needs it right, which is a higher bar than
a fan page needs.
