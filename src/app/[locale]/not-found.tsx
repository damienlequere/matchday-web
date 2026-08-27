import Link from "next/link";

import { DEFAULT_LOCALE } from "@/i18n/config";
import { getDictionary } from "@/i18n";

/**
 * A not-found page cannot read the `[locale]` param — Next renders it outside
 * the matched route — so it falls back to the default locale. The alternative,
 * a client component reading the pathname, would ship JS for a page nobody is
 * meant to reach.
 */
export default function NotFound() {
  const d = getDictionary(DEFAULT_LOCALE);

  return (
    <main className="wrap" style={{ padding: "80px 24px" }}>
      <p className="eyebrow">{d.notFound.eyebrow}</p>
      <h1 style={{ fontSize: 34, marginTop: 8 }}>{d.notFound.title}</h1>
      <p style={{ marginTop: 12, color: "var(--ink-2)" }}>
        {d.notFound.body}{" "}
        <Link href={`/${DEFAULT_LOCALE}`}>{d.notFound.back}</Link>.
      </p>
    </main>
  );
}
