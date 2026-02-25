import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..", "..");

const requiredFiles = [
  "docs/parity/c1-operation-domain-matrix.json",
  "docs/parity/c1-operation-domain-summary.md",
  "docs/parity/c2-domain-implementation-plan.md",
  "docs/parity/c3-operation-compatibility-contracts.json",
  "docs/parity/c3-operation-compatibility-contracts.md",
  "docs/parity/m5-merge-readiness.md",
  "docs/security/csp-checklist.md",
  "SECURITY.md"
];

for (const rel of requiredFiles) {
  const abs = resolve(repoRoot, rel);
  if (!existsSync(abs)) {
    throw new Error(`[release] missing required artifact: ${rel}`);
  }
}

const c3SummaryPath = resolve(repoRoot, "docs", "parity", "c3-operation-compatibility-contracts.md");
const c3Summary = readFileSync(c3SummaryPath, "utf-8");
if (!c3Summary.includes("Generated: 1970-01-01T00:00:00.000Z")) {
  throw new Error("[release] c3 summary must be deterministically generated");
}

process.stdout.write("[release] readiness checks passed\n");
