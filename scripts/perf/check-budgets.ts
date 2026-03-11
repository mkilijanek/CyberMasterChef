import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { InMemoryRegistry, runRecipe } from "../../packages/core/src/index.ts";
import { sha256 } from "../../packages/plugins-standard/src/ops/sha256.ts";
import { scrypt } from "../../packages/plugins-standard/src/ops/scrypt.ts";
import {
  buildReportPayload,
  createBudgetResults,
  median,
  renderMarkdownReport,
  summarizeBudgetFailures
} from "./report-lib.mjs";

type Row = {
  label: string;
  samplesMs: number[];
  medianMs: number;
  maxMs: number;
};

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const budgetsPath = join(repoRoot, "docs", "perf", "budgets.json");
const reportJsonPath = join(repoRoot, "docs", "perf", "latest-benchmark-report.json");
const reportMdPath = join(repoRoot, "docs", "perf", "latest-benchmark-report.md");

async function measure(
  label: string,
  fn: () => Promise<void>,
  runs: number,
  warmup = 1
): Promise<Row> {
  for (let i = 0; i < warmup; i++) await fn();
  const samples: number[] = [];
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    await fn();
    samples.push(performance.now() - start);
  }
  return {
    label,
    samplesMs: samples.map((v) => Number(v.toFixed(3))),
    medianMs: Number(median(samples).toFixed(3)),
    maxMs: Number(Math.max(...samples).toFixed(3))
  };
}

async function benchOps(): Promise<Row[]> {
  const registry = new InMemoryRegistry();
  registry.register(sha256);
  registry.register(scrypt);

  const oneMiB = new Uint8Array(1024 * 1024);
  for (let i = 0; i < oneMiB.length; i++) oneMiB[i] = i & 0xff;

  const shaRecipe = { version: 1 as const, steps: [{ opId: "hash.sha256" }] };
  const scryptRecipe = {
    version: 1 as const,
    steps: [
      {
        opId: "crypto.scrypt",
        args: {
          salt: "salt",
          saltEncoding: "utf8",
          length: 32,
          costN: 16384,
          blockSizeR: 8,
          parallelizationP: 1,
          maxmem: 67108864
        }
      }
    ]
  };

  const shaBench = await measure("ops.hash_sha256_1mib", async () => {
    await runRecipe({
      registry,
      recipe: shaRecipe,
      input: { type: "bytes", value: oneMiB }
    });
  }, 7);

  const scryptBench = await measure("ops.scrypt_default", async () => {
    await runRecipe({
      registry,
      recipe: scryptRecipe,
      input: { type: "string", value: "password" }
    });
  }, 3);

  return [shaBench, scryptBench];
}

async function benchCliBatch(): Promise<Row> {
  const recipePath = join(repoRoot, "packages", "cli", "test", "fixtures", "recipe.identity.json");
  const batchInputDir = join(repoRoot, "packages", "cli", "test", "fixtures", "batch-input");
  const sourceEntry = join(repoRoot, "packages", "cli", "src", "main.ts");

  return measure(
    "cli.batch_report",
    async () => {
      const tempDir = mkdtempSync(join(tmpdir(), "cmc-perf-"));
      const reportPath = join(tempDir, "report.json");
      const run = spawnSync(
        "node",
        [
          "--import",
          "tsx",
          sourceEntry,
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
        ],
        {
          cwd: repoRoot,
          encoding: "utf-8",
          env: { ...process.env, TSX_TSCONFIG_PATH: join(repoRoot, "tsconfig.base.json") }
        }
      );
      rmSync(tempDir, { recursive: true, force: true });
      if (run.status !== 0) {
        throw new Error(run.stderr || run.stdout || "CLI batch benchmark failed");
      }
    },
    5
  );
}

function writeReports(
  results: Array<Row & { budgetMs: number; ok: boolean }>,
  failures: string[]
): void {
  const payload = buildReportPayload(results, failures, new Date().toISOString());
  writeFileSync(reportJsonPath, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
  writeFileSync(reportMdPath, renderMarkdownReport(payload), "utf-8");
}

async function main() {
  const budgets = JSON.parse(readFileSync(budgetsPath, "utf-8")) as {
    benchmarks: Array<{ label: string; maxMedianMs: number }>;
  };
  const measured = [...(await benchOps()), await benchCliBatch()];
  const results = createBudgetResults(measured, budgets.benchmarks);
  const failures = summarizeBudgetFailures(results);

  writeReports(results, failures);
  if (failures.length > 0) {
    throw new Error(`Performance budget check failed (${failures.length} benchmark(s))`);
  }
  console.log("[perf] budget check passed");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
