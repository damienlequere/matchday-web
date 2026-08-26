import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

import type { Club } from "@/types/club";

const DATA_DIR = path.join(process.cwd(), "data", "clubs");

/**
 * Data access layer.
 *
 * Today: JSON files. Tomorrow: an HTTP client against the aggregator.
 * Components only ever know these signatures, never the source — that is what
 * makes the swap painless, and what keeps the project rule intact: losing a
 * provider must degrade the product, not kill it.
 */

export async function listClubSlugs(): Promise<string[]> {
  const entries = await fs.readdir(DATA_DIR);
  return entries
    .filter((name) => name.endsWith(".json"))
    .map((name) => name.replace(/\.json$/, ""));
}

export async function getClub(slug: string): Promise<Club | null> {
  // Guard rail: a slug must never be able to walk up the tree.
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${slug}.json`), "utf8");
    return JSON.parse(raw) as Club;
  } catch {
    return null;
  }
}

export async function getAllClubs(): Promise<Club[]> {
  const slugs = await listClubSlugs();
  const clubs = await Promise.all(slugs.map(getClub));
  return clubs.filter((club): club is Club => club !== null);
}
