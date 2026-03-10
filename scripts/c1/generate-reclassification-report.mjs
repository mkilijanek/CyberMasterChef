import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..", "..");
const parityDir = resolve(repoRoot, "docs", "parity");
const c1MatrixPath = resolve(parityDir, "c1-operation-domain-matrix.json");
const outPath = resolve(parityDir, "c1-misc-reclassification.md");

const rows = JSON.parse(readFileSync(c1MatrixPath, "utf-8"));
const miscRows = rows
  .filter((row) => row.domain === "misc-uncategorized")
  .sort((a, b) => a.operationName.localeCompare(b.operationName, "en", { sensitivity: "base" }));

const generatedAt = process.env.SOURCE_DATE_EPOCH
  ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString()
  : new Date(0).toISOString();

const lines = [
  "# C1 Misc Reclassification Workflow",
  "",
  `Generated: ${generatedAt}`,
  "",
  "## Purpose",
  "",
  "Track operations still classified as `misc-uncategorized` and review them on a recurring cadence.",
  "",
  "## Review cadence",
  "",
  "1. Regenerate `c1` artifacts.",
  "2. Regenerate this report.",
  "3. Review new or still-uncategorized entries.",
  "4. Update taxonomy rules in `scripts/c1/domain-taxonomy.mjs` when a stable rule is justified.",
  "5. Re-run `pnpm c1:check` and `pnpm c1:reclassify-check`.",
  "",
  "## Current backlog",
  "",
  `- Total uncategorized operations: ${miscRows.length}`,
  ""
];

for (const row of miscRows) {
  lines.push(`- ${row.operationName} (${row.file}) [${row.confidence}]`);
}

mkdirSync(parityDir, { recursive: true });
writeFileSync(outPath, `${lines.join("\n")}\n`, "utf-8");
process.stdout.write(`[c1] generated misc reclassification report -> ${outPath}\n`);
