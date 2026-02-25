import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = dirname(here);
const sourceEntry = join(packageRoot, "src", "main.ts");
const fixturesRoot = join(here, "fixtures");
const recipePath = join(fixturesRoot, "recipe.identity.json");
const batchInputDir = join(fixturesRoot, "batch-input");
const expectedNormalizedPath = join(
  fixturesRoot,
  "expected",
  "batch-report.normalized.json"
);

type BatchRow = {
  file: string;
  ok: boolean;
  outputType: "string" | "bytes" | "json";
  outputPreview?: string;
  error?: string;
};

function runCli(args: string[]) {
  return spawnSync("node", ["--import", "tsx", sourceEntry, ...args], {
    cwd: packageRoot,
    encoding: "utf-8"
  });
}

describe("CLI batch integration", () => {
  it("processes batch directory concurrently and matches expected snapshot", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "cmc-cli-batch-"));
    const reportPath = join(tempDir, "report.json");
    const run = runCli([
      recipePath,
      "--batch-input-dir",
      batchInputDir,
      "--batch-ext",
      ".txt",
      "--batch-skip-empty",
      "--batch-concurrency",
      "3",
      "--batch-report-file",
      reportPath
    ]);
    expect(run.status).toBe(0);

    const stdoutReport = JSON.parse(run.stdout) as BatchRow[];
    const fileReport = JSON.parse(readFileSync(reportPath, "utf-8")) as BatchRow[];
    expect(fileReport).toEqual(stdoutReport);

    const normalized = stdoutReport.map((row) => ({
      file: basename(row.file),
      ok: row.ok,
      outputType: row.outputType,
      outputPreview: row.outputPreview,
      error: row.error
    }));
    const expected = JSON.parse(
      readFileSync(expectedNormalizedPath, "utf-8")
    ) as Array<{
      file: string;
      ok: boolean;
      outputType: "string" | "bytes" | "json";
      outputPreview?: string;
      error?: string;
    }>;
    expect(normalized).toEqual(expected);
  });

  it("honors fail-fast semantics with batch-fail-empty", () => {
    const run = runCli([
      recipePath,
      "--batch-input-dir",
      batchInputDir,
      "--batch-ext",
      ".txt",
      "--batch-fail-empty",
      "--batch-fail-fast",
      "--batch-concurrency",
      "8"
    ]);
    expect(run.status).toBe(0);
    const report = JSON.parse(run.stdout) as BatchRow[];
    expect(report).toHaveLength(1);
    expect(basename(report[0]?.file ?? "")).toBe("0-empty.txt");
    expect(report[0]?.ok).toBe(false);
    expect(report[0]?.error).toBe("Empty input file");
  });
});
