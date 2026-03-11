import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export const requiredFiles = [
  "docs/parity/c1-operation-domain-matrix.json",
  "docs/parity/c1-operation-domain-summary.md",
  "docs/parity/c2-domain-implementation-plan.md",
  "docs/parity/c3-operation-compatibility-contracts.json",
  "docs/parity/c3-operation-compatibility-contracts.md",
  "docs/parity/m5-merge-readiness.md",
  "docs/security/csp-checklist.md",
  "docs/security/runtime-hardening.md",
  "docs/perf/budgets.json",
  "docs/perf/asset-budgets.json",
  "docs/perf/latest-benchmark-report.md",
  "docs/perf/latest-benchmark-report.json",
  "docs/release/release-train.md",
  "docs/release/release-1.0.0-plan.md",
  "docs/release/release-evidence-checklist.md",
  "docs/release/rollback-and-dry-run.md",
  "docs/release/m10-final-audit.md",
  "docs/runbooks/ci-incidents.md",
  "docs/runbooks/security-incidents.md",
  "docs/runbooks/runtime-incidents.md",
  "docs/runbooks/container-operations.md",
  "docs/operations/observability-baseline.md",
  "docs/operations/slo-sla.md",
  ".github/CODEOWNERS",
  "README.md",
  "SECURITY.md"
];

export function validateRequiredFiles(repoRoot, files = requiredFiles) {
  for (const rel of files) {
    const abs = resolve(repoRoot, rel);
    if (!existsSync(abs)) {
      throw new Error(`[release] missing required artifact: ${rel}`);
    }
  }
}

export function validateDeterministicArtifacts(repoRoot) {
  const c3SummaryPath = resolve(repoRoot, "docs", "parity", "c3-operation-compatibility-contracts.md");
  const c3Summary = readFileSync(c3SummaryPath, "utf-8");
  if (!c3Summary.includes("Generated: 1970-01-01T00:00:00.000Z")) {
    throw new Error("[release] c3 summary must be deterministically generated");
  }
}

export function validateReleaseEvidenceDocs(repoRoot) {
  const checklistPath = resolve(repoRoot, "docs", "release", "release-evidence-checklist.md");
  const checklist = readFileSync(checklistPath, "utf-8");
  const requiredChecklistEntries = [
    "`pnpm run ci:full`",
    "`pnpm test:e2e`",
    "`pnpm docker:test`",
    "`CI` / `Container` / `CodeQL`",
    "`ghcr.io/mkilijanek/cybermasterchef`",
    "`docs/perf/latest-benchmark-report.md`"
  ];
  for (const entry of requiredChecklistEntries) {
    if (!checklist.includes(entry)) {
      throw new Error(`[release] release evidence checklist missing entry: ${entry}`);
    }
  }

  const containerOpsPath = resolve(repoRoot, "docs", "runbooks", "container-operations.md");
  const containerOps = readFileSync(containerOpsPath, "utf8");
  const requiredOpsEntries = [
    "`docker compose up --build -d`",
    "`docker compose logs -f cybermasterchef`",
    "`/healthz`",
    "GHCR",
    "rollback"
  ];
  for (const entry of requiredOpsEntries) {
    if (!containerOps.includes(entry)) {
      throw new Error(`[release] container operations runbook missing entry: ${entry}`);
    }
  }
}
