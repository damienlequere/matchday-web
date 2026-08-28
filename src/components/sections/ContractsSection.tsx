import type { ContractStatus, ContractSummary } from "@/lib/contracts";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/sections/Section";
import { formatContractRemaining, formatLongDate } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

import styles from "./ContractsSection.module.css";

/**
 * Contract expiries.
 *
 * The value is not any single date — those are findable elsewhere — but the
 * whole squad's dates in one view, sorted by urgency. That view only exists
 * because membership is modelled as a dated relation rather than free text.
 */

const STATUS_CLASS: Record<ContractStatus, string | undefined> = {
  expiring: styles.expiring,
  "final-year": styles.finalYear,
  secure: styles.secure,
  unknown: styles.unknown,
};

export function ContractsSection({
  contracts,
  dict,
  locale,
}: {
  contracts: ContractSummary;
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <Section
      id="contracts"
      title={dict.contracts.title}
    >
      <div className={styles.wrapper}>
        {/*
          The headline figures, drawn as the joined strip the other sections
          use. The three counts hold their slots whatever they read: a stated
          zero on expiries is an answer, and dropping the tile would leave the
          reader working out which of the three is missing.
        */}
        <div className={styles.counts}>
          <div className={`${styles.figure} ${styles.figureExpiring}`}>
            <div className={styles.count}>{contracts.expiringCount}</div>
            <div className={styles.countLabel}>
              {dict.contracts.expiringCount}
            </div>
          </div>
          <div className={`${styles.figure} ${styles.figureFinalYear}`}>
            <div className={styles.count}>{contracts.finalYearCount}</div>
            <div className={styles.countLabel}>
              {dict.contracts.finalYearCount}
            </div>
          </div>
          <div className={styles.figure}>
            <div className={styles.count}>{contracts.unknownCount}</div>
            <div className={styles.countLabel}>
              {dict.contracts.unknownCount}
            </div>
          </div>
        </div>

        <div className={styles.legend}>
          {(Object.keys(dict.contracts.status) as ContractStatus[]).map((status) => (
            <span className={styles.key} key={status}>
              <span className={`${styles.swatch} ${STATUS_CLASS[status]}`} />
              {dict.contracts.status[status]}
            </span>
          ))}
        </div>

        <Card padded={false}>
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col" className={styles.marker}>
                    <span className="visually-hidden">
                      {dict.contracts.table.status}
                    </span>
                  </th>
                  <th scope="col">{dict.contracts.table.player}</th>
                  <th scope="col">{dict.contracts.table.position}</th>
                  <th scope="col" className={styles.num}>
                    {dict.contracts.table.age}
                  </th>
                  <th scope="col" className={styles.num}>
                    {dict.contracts.table.contractTo}
                  </th>
                  <th scope="col" className={styles.num}>
                    {dict.contracts.table.remaining}
                  </th>
                </tr>
              </thead>
              <tbody>
                {contracts.rows.map((row) => (
                  <tr key={row.stint.playerSlug}>
                    <td
                      className={`${styles.marker} ${STATUS_CLASS[row.status]}`}
                    >
                      <span className="visually-hidden">
                        {dict.contracts.status[row.status]}
                      </span>
                    </td>
                    <td>
                      <span className={styles.player}>
                        {row.stint.playerName}
                      </span>
                      {row.stint.onLoan ? (
                        <span className={styles.loan}>{dict.contracts.loan}</span>
                      ) : null}
                    </td>
                    <td className={styles.pos}>{row.stint.position}</td>
                    <td className={styles.num}>{row.age}</td>
                    <td className={styles.num}>
                      {row.stint.contractUntil ? (
                        formatLongDate(locale, row.stint.contractUntil)
                      ) : (
                        <span className={styles.unknownText}>
                          {dict.contracts.notKnown}
                        </span>
                      )}
                    </td>
                    <td className={styles.num}>
                      {formatContractRemaining(locale, row.monthsRemaining)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Section>
  );
}
