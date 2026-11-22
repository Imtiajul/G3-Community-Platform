import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines conditional class names using clsx and merges Tailwind classes cleanly
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts English digits to Bangla numerals (০, ১, ২, ...)
 */
export function banglaNumber(input: number | string | null | undefined): string {
  if (input === null || input === undefined) return "";
  const enDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

  return String(input).replace(/[0-9]/g, (digit) => {
    const idx = enDigits.indexOf(digit);
    return idx !== -1 ? (bnDigits[idx] ?? digit) : digit;
  });
}

/**
 * Formats dates nicely in Bengali (e.g. ১৫ মে, ২০২৪)
 */
export function formatDateBn(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "";
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("bn-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return String(dateInput);
  }
}

/**
 * Validates and sanitizes relative redirect paths to prevent open redirect attacks
 */
export function sanitizeRedirectPath(
  path: string | null | undefined,
  fallback = "/feed"
): string {
  if (!path) return fallback;
  // Must start with single slash, not double slash or backslash
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
    return fallback;
  }
  // Disallow javascript:, data:, or external URLs
  if (path.includes(":") || path.includes("@")) {
    return fallback;
  }
  return path;
}
