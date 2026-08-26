import type { ContractStatus, ContractSummary } from "@/lib/contracts";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/sections/Section";
import { formatContractRemaining, formatLongDate } from "@/lib/format";

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

const STATUS_LABEL: Record<ContractStatus, string> = {
  expiring: "Expiring",
  "final-year": "Final year",
  secure: "Under contract",
  unknown: "Unknown",
};

export function ContractsSection({ contracts }: { contracts: ContractSummary }) {
  return (
    <Section
      id="contracts"
      title="Contract expiries"
      lede={`Who is out of contract on ${formatLongDate(contracts.seasonEnd)}, who is in their final year, and who is tied down. Dates only — an unknown date is shown as unknown, never estimated.`}
    >
      <div className={styles.wrapper}>
        <div className={styles.counts}>
          <div>
            <div className={styles.count}>{contracts.expiringCount}</div>
            <div className={styles.countLabel}>Out of contract in June</div>
          </div>
          <div>
            <div className={styles.count}>{contracts.finalYearCount}</div>
            <div className={styles.countLabel}>In their final year</div>
          </div>
          <div>
            <div className={styles.count}>{contracts.unknownCount}</div>
            <div className={styles.countLabel}>Date not known</div>
          </div>
        </div>

        <div className={styles.legend}>
          {(Object.keys(STATUS_LABEL) as ContractStatus[]).map((status) => (
            <span className={styles.key} key={status}>
              <span className={`${styles.swatch} ${STATUS_CLASS[status]}`} />
              {STATUS_LABEL[status]}
            </span>
          ))}
        </div>

        <Card padded={false}>
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col" className={styles.marker}>
                    <span className="visually-hidden">Status</span>
                  </th>
                  <th scope="col">Player</th>
                  <th scope="col">Position</th>
                  <th scope="col" className={styles.num}>Age</th>
                  <th scope="col" className={styles.num}>Contract to</th>
                  <th scope="col" className={styles.num}>Remaining</th>
                </tr>
              </thead>
              <tbody>
                {contracts.rows.map((row) => (
                  <tr key={row.stint.playerSlug}>
                    <td
                      className={`${styles.marker} ${STATUS_CLASS[row.status]}`}
                    >
                      <span className="visually-hidden">
                        {STATUS_LABEL[row.status]}
                      </span>
                    </td>
                    <td>
                      <span className={styles.player}>
                        {row.stint.playerName}
                      </span>
                      {row.stint.onLoan ? (
                        <span className={styles.loan}>Loan</span>
                      ) : null}
                    </td>
                    <td className={styles.pos}>{row.stint.position}</td>
                    <td className={styles.num}>{row.age}</td>
                    <td className={styles.num}>
                      {row.stint.contractUntil ? (
                        formatLongDate(row.stint.contractUntil)
                      ) : (
                        <span className={styles.unknownText}>Not known</span>
                      )}
                    </td>
                    <td className={styles.num}>
                      {formatContractRemaining(row.monthsRemaining)}
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
