/**
 * Tiny classlist joiner. Filters falsy values so conditional classes read
 * cleanly: cn("base", isActive && "active", className).
 *
 * Deliberately not `tailwind-merge` — components are structured so the caller's
 * `className` comes last and simply wins, which keeps dependencies minimal
 * (AGENTS.md Section 4).
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
