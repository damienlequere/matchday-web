import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { en, type Dictionary } from "@/i18n/dictionaries/en";
import { fr } from "@/i18n/dictionaries/fr";

const DICTIONARIES: Record<Locale, Dictionary> = { en, fr };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

/** Looks a data-carried label up, falling back to the raw value. */
export function translateData(
  table: Record<string, string>,
  value: string,
): string {
  return table[value] ?? value;
}

export type { Dictionary };
export type { Locale };
