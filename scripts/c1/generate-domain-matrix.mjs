import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, relative } from "node:path";
import { classifyOperation, DOMAIN_DESCRIPTIONS, DOMAIN_ORDER } from "./domain-taxonomy.mjs";
import { parseCsv, toCsv } from "./csv-utils.mjs";

const repoRoot = resolve(import.meta.dirname, "..", "..");
const repoRefDir = resolve(repoRoot, "ref");
const externalRefDir = resolve(repoRoot, "..", "ref");
const refDir = existsSync(resolve(repoRefDir, "CyberChef_all_operations_list.csv"))
  ? repoRefDir
  : externalRefDir;
const repoParityDir = resolve(repoRoot, "docs", "parity");
const sourceCsvPath = resolve(refDir, "CyberChef_all_operations_list.csv");
const outJsonPath = resolve(refDir, "c1-operation-domain-matrix.json");
const outCsvPath = resolve(refDir, "c1-operation-domain-matrix.csv");
const outMdPath = resolve(refDir, "c1-operation-domain-summary.md");
const repoOutJsonPath = resolve(repoParityDir, "c1-operation-domain-matrix.json");
const repoOutCsvPath = resolve(repoParityDir, "c1-operation-domain-matrix.csv");
const repoOutMdPath = resolve(repoParityDir, "c1-operation-domain-summary.md");
const toRel = (value) => relative(repoRoot, value);

const csvText = readFileSync(sourceCsvPath, "utf-8");
const records = parseCsv(csvText);

const mapped = records.map((record, index) => {
  const operationName = record.OperationName ?? "";
  const fileName = record.File ?? "";
  const classified = classifyOperation(operationName, fileName);
  return {
    index: index + 1,
    operationName,
    file: fileName,
    originalCategory: record.Category ?? "",
    domain: classified.domain,
    confidence: classified.confidence,
    matchedBy: classified.matchedBy
  };
});

mapped.sort((a, b) => {
  const da = DOMAIN_ORDER.indexOf(a.domain);
  const db = DOMAIN_ORDER.indexOf(b.domain);
  if (da !== db) return da - db;
  return a.operationName.localeCompare(b.operationName, "en", { sensitivity: "base" });
});

const totals = new Map(DOMAIN_ORDER.map((d) => [d, 0]));
for (const row of mapped) {
  totals.set(row.domain, (totals.get(row.domain) ?? 0) + 1);
}

writeFileSync(outJsonPath, `${JSON.stringify(mapped, null, 2)}\n`, "utf-8");
mkdirSync(repoParityDir, { recursive: true });
writeFileSync(repoOutJsonPath, `${JSON.stringify(mapped, null, 2)}\n`, "utf-8");
writeFileSync(
  outCsvPath,
  toCsv(mapped, [
    "index",
    "operationName",
    "file",
    "originalCategory",
    "domain",
    "confidence",
    "matchedBy"
  ]),
  "utf-8"
);
writeFileSync(
  repoOutCsvPath,
  toCsv(mapped, [
    "index",
    "operationName",
    "file",
    "originalCategory",
    "domain",
    "confidence",
    "matchedBy"
  ]),
  "utf-8"
);

const uncategorizedPreview = mapped
  .filter((x) => x.domain === "misc-uncategorized")
  .slice(0, 40)
  .map((x) => `- ${x.operationName} (${x.file})`)
  .join("\n");

const generatedAt = process.env.SOURCE_DATE_EPOCH
  ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString()
  : new Date(0).toISOString();

const summaryLines = [
  "# C1 Domain Matrix Summary",
  "",
  `Generated: ${generatedAt}`,
  `Source: ${toRel(sourceCsvPath)}`,
  `Total operations: ${mapped.length}`,
  "",
  "## Domain counts",
  ""
];

for (const domain of DOMAIN_ORDER) {
  const count = totals.get(domain) ?? 0;
  const pct = mapped.length > 0 ? ((count / mapped.length) * 100).toFixed(2) : "0.00";
  summaryLines.push(`- ${domain}: ${count} (${pct}%)`);
  summaryLines.push(`  - ${DOMAIN_DESCRIPTIONS[domain]}`);
}

summaryLines.push("");
summaryLines.push("## Misc/uncategorized preview (first 40)");
summaryLines.push("");
summaryLines.push(uncategorizedPreview.length > 0 ? uncategorizedPreview : "- none");
summaryLines.push("");
summaryLines.push("## Artifacts");
summaryLines.push("");
summaryLines.push(`- JSON: ${toRel(repoOutJsonPath)}`);
summaryLines.push(`- CSV: ${toRel(repoOutCsvPath)}`);
summaryLines.push(`- Summary: ${toRel(repoOutMdPath)}`);
summaryLines.push(`- Ref copy JSON: ${toRel(outJsonPath)}`);
summaryLines.push(`- Ref copy CSV: ${toRel(outCsvPath)}`);
summaryLines.push(`- Ref copy summary: ${toRel(outMdPath)}`);
summaryLines.push("");

writeFileSync(outMdPath, `${summaryLines.join("\n")}\n`, "utf-8");
writeFileSync(repoOutMdPath, `${summaryLines.join("\n")}\n`, "utf-8");

process.stdout.write(
  `[c1] generated domain matrix for ${mapped.length} operations -> ${repoOutJsonPath}, ${repoOutCsvPath}, ${repoOutMdPath}\n`
);
