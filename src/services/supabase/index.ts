/**
 * Data access layer — the ONLY surface feature code should import to talk to
 * Supabase (per AGENTS.md Section 2). Components call these functions or the
 * hooks built on top of them; they never touch the client directly.
 */
export type { Result } from "./result";
export type { TypedSupabaseClient } from "./client";

export * from "./categories";
export * from "./products";
export * from "./orders";
export * from "./recap";
export { checkSupabaseConnection } from "./health";
