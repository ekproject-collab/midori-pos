// Concatenates supabase/migrations/*.sql (in filename order) into
// supabase/_apply_all.generated.sql for one-paste setup in the Supabase SQL Editor.
// Run: node scripts/build-sql.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = join(root, "supabase", "migrations");
const outFile = join(root, "supabase", "_apply_all.generated.sql");

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const header = [
  "-- =============================================================================",
  "-- GENERATED FILE — do not edit. Concatenation of migrations/ in order.",
  "-- Regenerate: node scripts/build-sql.mjs",
  "-- Paste this whole file into the Supabase SQL Editor to set up the database.",
  "-- Then run seed.sql separately for development data.",
  "-- =============================================================================",
  "",
];

const body = files.flatMap((f) => [
  "",
  `-- >>> migrations/${f}`,
  "",
  readFileSync(join(migrationsDir, f), "utf8").trimEnd(),
  "",
]);

writeFileSync(outFile, [...header, ...body].join("\n") + "\n");
console.log(`Wrote ${outFile} from ${files.length} migration(s).`);
