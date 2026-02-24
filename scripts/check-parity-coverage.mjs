import fs from "node:fs";

const threshold = Number(process.env.PARITY_THRESHOLD ?? "0.9");
const corpusPath = "packages/plugins-standard/test/fixtures/parity-corpus.json";
const goldenPath = "packages/plugins-standard/test/goldenRecipes.test.ts";

const corpus = JSON.parse(fs.readFileSync(corpusPath, "utf8"));
const goldenText = fs.readFileSync(goldenPath, "utf8");
const names = [...goldenText.matchAll(/name:\s*"([^"]+)"/g)].map((m) => m[1]);

const corpusSet = new Set(corpus);
const covered = names.filter((n) => corpusSet.has(n));
const missing = corpus.filter((n) => !names.includes(n));
const ratio = corpus.length === 0 ? 1 : covered.length / corpus.length;

console.log(
  `[parity] covered=${covered.length}/${corpus.length} ratio=${ratio.toFixed(3)} threshold=${threshold.toFixed(3)}`
);
if (missing.length > 0) {
  console.log(`[parity] missing: ${missing.join(" | ")}`);
}

if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
  throw new Error(`Invalid PARITY_THRESHOLD: ${threshold}`);
}
if (ratio < threshold) {
  process.exit(1);
}
