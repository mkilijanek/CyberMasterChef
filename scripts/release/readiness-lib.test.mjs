import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import {
  requiredFiles,
  validateDeterministicArtifacts,
  validateReleaseEvidenceDocs,
  validateRequiredFiles
} from "./readiness-lib.mjs";

function setupRepoFixture() {
  const repoRoot = mkdtempSync(resolve(tmpdir(), "cmc-release-readiness-"));
  for (const rel of requiredFiles) {
    const abs = resolve(repoRoot, rel);
    mkdirSync(resolve(abs, ".."), { recursive: true });
    writeFileSync(abs, "placeholder\n", "utf8");
  }
  writeFileSync(
    resolve(repoRoot, "docs/parity/c3-operation-compatibility-contracts.md"),
    "Generated: 1970-01-01T00:00:00.000Z\n",
    "utf8"
  );
  writeFileSync(
    resolve(repoRoot, "docs/release/release-evidence-checklist.md"),
    [
      "`pnpm run ci:full`",
      "`pnpm test:e2e`",
      "`pnpm docker:test`",
      "`CI` / `Container` / `CodeQL`",
      "`ghcr.io/mkilijanek/cybermasterchef`",
      "`docs/perf/latest-benchmark-report.md`"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    resolve(repoRoot, "docs/runbooks/container-operations.md"),
    [
      "`docker compose up -d`",
      "`docker compose --profile local up --build -d`",
      "`docker compose logs -f cybermasterchef`",
      "`/healthz`",
      "GHCR",
      "rollback"
    ].join("\n"),
    "utf8"
  );
  return repoRoot;
}

test("release readiness helpers accept a complete fixture", () => {
  const repoRoot = setupRepoFixture();
  try {
    assert.doesNotThrow(() => validateRequiredFiles(repoRoot));
    assert.doesNotThrow(() => validateDeterministicArtifacts(repoRoot));
    assert.doesNotThrow(() => validateReleaseEvidenceDocs(repoRoot));
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test("validateRequiredFiles rejects missing artifacts", () => {
  const repoRoot = setupRepoFixture();
  try {
    rmSync(resolve(repoRoot, "README.md"));
    assert.throws(
      () => validateRequiredFiles(repoRoot),
      /missing required artifact: README\.md/
    );
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test("validateDeterministicArtifacts rejects non-deterministic summaries", () => {
  const repoRoot = setupRepoFixture();
  try {
    writeFileSync(
      resolve(repoRoot, "docs/parity/c3-operation-compatibility-contracts.md"),
      "Generated: 2026-03-11T00:00:00.000Z\n",
      "utf8"
    );
    assert.throws(
      () => validateDeterministicArtifacts(repoRoot),
      /c3 summary must be deterministically generated/
    );
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test("validateReleaseEvidenceDocs rejects missing checklist and ops entries", () => {
  const repoRoot = setupRepoFixture();
  try {
    writeFileSync(resolve(repoRoot, "docs/release/release-evidence-checklist.md"), "`pnpm docker:test`\n", "utf8");
    assert.throws(
      () => validateReleaseEvidenceDocs(repoRoot),
      /release evidence checklist missing entry: `pnpm run ci:full`/
    );

    writeFileSync(
      resolve(repoRoot, "docs/release/release-evidence-checklist.md"),
      [
        "`pnpm run ci:full`",
        "`pnpm test:e2e`",
        "`pnpm docker:test`",
        "`CI` / `Container` / `CodeQL`",
        "`ghcr.io/mkilijanek/cybermasterchef`",
        "`docs/perf/latest-benchmark-report.md`"
      ].join("\n"),
      "utf8"
    );
    writeFileSync(resolve(repoRoot, "docs/runbooks/container-operations.md"), "`/healthz`\n", "utf8");
    assert.throws(
      () => validateReleaseEvidenceDocs(repoRoot),
      /container operations runbook missing default GHCR and local-profile startup commands/
    );
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});
