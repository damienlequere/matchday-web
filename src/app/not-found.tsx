import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap" style={{ padding: "80px 24px" }}>
      <p className="eyebrow">404</p>
      <h1 style={{ fontSize: 34, marginTop: 8 }}>No such club</h1>
      <p style={{ marginTop: 12, color: "var(--ink-2)" }}>
        This hub covers three clubs for now.{" "}
        <Link href="/">Back to the index</Link>.
      </p>
    </main>
  );
}
