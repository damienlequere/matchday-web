import type {
  AtRiskPlayer,
  LineStatus,
  SquadStatus,
  UnavailablePlayer,
} from "@/lib/squad-status";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Section } from "@/components/sections/Section";
import { formatMatches, formatWeekdayDate, formatHeavyWeeks } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

import styles from "./SquadStatusSection.module.css";

/**
 * Squad status — the synthesis block.
 *
 * It sits above suspensions and the injury room because a summary placed after
 * what it summarises is not a summary, it is a repetition. Everything here is a
 * join over those two blocks; nothing here is a figure they already print on
 * its own.
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
}: {
  status: SquadStatus;
  dict: Dictionary;
  locale: Locale;
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
          The headline pair. Kept side by side but never summed: the divider
          between them is the point, not decoration.
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

          <div className={`${styles.figure} ${styles.soft}`}>
            <div className={styles.figureValue}>{status.doubtfulCount}</div>
            <div className={styles.figureLabel}>{dict.squadStatus.doubtful}</div>
            <div className={styles.figureNote}>
              {dict.squadStatus.doubtfulNote}
            </div>
          </div>

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

            {status.heavyWeeks > 0 ? (
              <p className={styles.congestion}>
                <Pill tone="warn">{dict.congestion.severity.heavy}</Pill>
                <span>
                  {dict.squadStatus.congestion(
                    formatHeavyWeeks(locale, status.heavyWeeks),
                  )}
                </span>
              </p>
            ) : null}
          </Card>
        </div>

        <p className={styles.note}>{dict.squadStatus.note}</p>
      </div>
    </Section>
  );
}
