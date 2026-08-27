import type { ReactNode } from "react";

import type {
  AtRiskPlayer,
  LineStatus,
  SquadStatus,
  UnavailablePlayer,
} from "@/lib/squad-status";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/sections/Section";
import { formatMatches, formatWeekdayDate } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

import styles from "./SquadStatusSection.module.css";

/**
 * Squad status — the synthesis block.
 *
 * Suspensions and the injury room are folded into it rather than printed after
 * it, because a summary placed above what it summarises only works if the
 * reader is not asked to scroll past two long blocks to reach the rest of the
 * page. Everything at the top level here is a join over those two sources;
 * nothing here is a figure they already print on their own, and the sources
 * themselves sit one click away in `sources` so the join stays auditable.
 *
 * The layout enforces the one rule the data model insists on: a ban and an
 * injury are not the same kind of knowledge. Certain absences sit in one
 * column, matchday calls in a second that is visibly *not* added to the first,
 * and risks in a third. A reader who wants one number gets it, and it means
 * only what it says.
 */

function PlayerRow({
  player,
  dict,
  locale,
}: {
  player: UnavailablePlayer;
  dict: Dictionary;
  locale: Locale;
}) {
  const detail =
    player.cause === "suspension"
      ? dict.squadStatus.banDetail(
          player.detail,
          formatMatches(locale, player.matchesRemaining ?? 0),
        )
      : dict.injuries.area[player.detail as keyof typeof dict.injuries.area];

  return (
    <div className={styles.row}>
      <span className={styles.shirt}>{player.stint.shirtNumber ?? "—"}</span>
      <div className={styles.rowBody}>
        <span className={styles.player}>{player.stint.playerName}</span>
        <p className={styles.detail}>
          <span
            className={`${styles.cause} ${player.cause === "suspension" ? styles.suspension : styles.injury}`}
          >
            {dict.squadStatus.cause[player.cause]}
          </span>
          <span aria-hidden="true">·</span>
          <span>{detail}</span>
        </p>
      </div>
      <span className={styles.pos}>{player.stint.position}</span>
    </div>
  );
}

/** The competition is the whole detail here, so no dictionary lookup is needed. */
function AtRiskRow({ player }: { player: AtRiskPlayer }) {
  return (
    <div className={styles.row}>
      <span className={styles.shirt}>{player.stint.shirtNumber ?? "—"}</span>
      <div className={styles.rowBody}>
        <span className={styles.player}>{player.stint.playerName}</span>
        <p className={styles.detail}>{player.detail}</p>
      </div>
      <span className={styles.pos}>{player.stint.position}</span>
    </div>
  );
}

/**
 * One line of the pitch, as a bar.
 *
 * The bar is a rendering of the two numbers printed beside it, never a score:
 * a reader can check it by counting. "Thin" is a stated threshold rather than
 * an opinion, so it is labelled in words as well as colour.
 */
function LineBar({ line, dict }: { line: LineStatus; dict: Dictionary }) {
  return (
    <div className={styles.line}>
      <div className={styles.lineHead}>
        <span className={styles.linePos}>
          {dict.identity.position[line.position]}
        </span>
        {line.thin ? (
          <span className={styles.thin}>{dict.squadStatus.thin}</span>
        ) : null}
      </div>

      <div
        className={styles.pips}
        role="img"
        aria-label={dict.squadStatus.lineCount(line.available, line.squad)}
      >
        {Array.from({ length: line.squad }, (_, i) => (
          <span
            key={i}
            className={`${styles.pip} ${i < line.available ? styles.pipOn : styles.pipOut}`}
          />
        ))}
      </div>

      <p className={styles.lineCount} aria-hidden="true">
        {dict.squadStatus.lineCount(line.available, line.squad)}
      </p>
    </div>
  );
}

export function SquadStatusSection({
  status,
  dict,
  locale,
  sources,
}: {
  status: SquadStatus;
  dict: Dictionary;
  locale: Locale;
  /**
   * The source blocks this section joins, rendered as drawers beneath it.
   *
   * A slot rather than props for each block: what belongs behind the summary
   * is the page's decision, and passing the composed nodes keeps this section
   * from importing — and having to keep in step with — the signature of every
   * block it happens to fold in.
   */
  sources?: ReactNode;
}) {
  const next = status.nextFixture;

  return (
    <Section
      id="squad-status"
      title={dict.squadStatus.title}
      lede={dict.squadStatus.lede}
    >
      <div className={styles.wrapper}>
        <p className={styles.nextFixture}>
          {next
            ? dict.squadStatus.nextFixture(
                next.opponent,
                next.venue === "home",
                formatWeekdayDate(locale, next.kickoff),
              )
            : dict.squadStatus.noFixture}
        </p>

        {/*
          The headline figures. Kept side by side but never summed: the divider
          between them is the point, not decoration.

          Only the certain count is unconditional — it is the answer to the
          question the block asks, and zero missing is worth stating. The other
          two are omitted when empty: a tile reading "0 doubtful" spends the
          same space as a real figure to say nothing happened, and the detail
          card below already says it in words.
        */}
        <div className={styles.headline}>
          <div className={styles.figure}>
            <div className={styles.figureValue}>{status.certainCount}</div>
            <div className={styles.figureLabel}>
              {dict.squadStatus.unavailable}
            </div>
            <div className={styles.figureNote}>
              {dict.squadStatus.certainNote} · {dict.squadStatus.ofSquad(status.squadSize)}
            </div>
          </div>

          {status.doubtfulCount > 0 ? (
            <div className={`${styles.figure} ${styles.soft}`}>
              <div className={styles.figureValue}>{status.doubtfulCount}</div>
              <div className={styles.figureLabel}>
                {dict.squadStatus.doubtful}
              </div>
              <div className={styles.figureNote}>
                {dict.squadStatus.doubtfulNote}
              </div>
            </div>
          ) : null}

          {status.returning.length > 0 ? (
            <div className={`${styles.figure} ${styles.good}`}>
              <div className={styles.figureValue}>{status.returning.length}</div>
              <div className={styles.figureLabel}>
                {dict.squadStatus.returning}
              </div>
              <div className={styles.figureNote}>
                {status.returning.map((s) => s.playerName).join(", ")}
              </div>
            </div>
          ) : null}
        </div>

        <div className={styles.grid}>
          <Card>
            <p className={styles.blockTitle}>{dict.squadStatus.unavailable}</p>
            {status.unavailable.length === 0 ? (
              <p className={styles.empty}>{dict.squadStatus.noneUnavailable}</p>
            ) : (
              status.unavailable.map((player) => (
                <PlayerRow
                  key={player.stint.playerSlug}
                  player={player}
                  dict={dict}
                  locale={locale}
                />
              ))
            )}

            <p className={`${styles.blockTitle} ${styles.spaced}`}>
              {dict.squadStatus.doubtful}
            </p>
            {status.doubtful.length === 0 ? (
              <p className={styles.empty}>{dict.squadStatus.noneDoubtful}</p>
            ) : (
              status.doubtful.map((player) => (
                <PlayerRow
                  key={player.stint.playerSlug}
                  player={player}
                  dict={dict}
                  locale={locale}
                />
              ))
            )}

            <p className={`${styles.blockTitle} ${styles.spaced}`}>
              {dict.squadStatus.atRisk}
            </p>
            {status.atRisk.length === 0 ? (
              <p className={styles.empty}>{dict.squadStatus.noneAtRisk}</p>
            ) : (
              status.atRisk.map((player) => (
                <AtRiskRow key={player.stint.playerSlug} player={player} />
              ))
            )}
          </Card>

          {/* The only genuinely new information in the block. */}
          <Card>
            <p className={styles.blockTitle}>{dict.squadStatus.lines}</p>
            <p className={styles.linesNote}>{dict.squadStatus.linesNote}</p>
            <div className={styles.lines}>
              {status.lines.map((line) => (
                <LineBar key={line.position} line={line} dict={dict} />
              ))}
            </div>

            {status.heavyFixtures > 0 && status.congestionPressure ? (
              <p
                className={`${styles.congestion} ${styles[status.congestionPressure]}`}
              >
                {dict.squadStatus.congestion(
                  status.heavyFixtures,
                  status.upcomingCount,
                )}
              </p>
            ) : null}
          </Card>
        </div>

        <p className={styles.note}>{dict.squadStatus.note}</p>

        {/*
          The evidence, folded. Placed after the note that names it so the
          reader meets the claim, then the caveat, then the way to check both.
        */}
        {sources ? (
          <div className={styles.sources}>
            <p className={styles.sourcesLabel}>{dict.squadStatus.sources.label}</p>
            {sources}
          </div>
        ) : null}
      </div>
    </Section>
  );
}
