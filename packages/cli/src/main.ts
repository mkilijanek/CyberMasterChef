#!/usr/bin/env node
import {
  InMemoryRegistry,
  runRecipe,
  parseRecipe,
  importCyberChefRecipe,
  hashDataValue,
  hashRecipe,
  summarizeTrace,
  base64ToBytes,
  bytesToBase64,
  bytesToUtf8,
  hexToBytes,
  type DataValue,
  type Recipe
} from "@cybermasterchef/core";
import { standardPlugin } from "@cybermasterchef/plugins-standard";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import pkg from "../package.json";

const DEFAULT_TIMEOUT_MS = 10_000;

function die(msg: string): never {
  process.stderr.write(msg + "\n");
  process.exit(1);
}

function warn(msg: string): void {
  process.stderr.write(`[warn] ${msg}\n`);
}

const usageText =
  "Usage: cybermasterchef <recipe.json> [input.txt|-] [options]\n" +
  "  Reads input from stdin if [input.txt] is omitted or set to '-'.\n" +
  "Options:\n" +
  "  --timeout-ms <n>                  execution timeout in milliseconds\n" +
  "  --strict-cyberchef               fail if CyberChef import skips steps\n" +
  "  --dry-run                        validate recipe and exit without execution\n" +
  "  --fail-on-warning                fail if import warnings are emitted\n" +
  "  --quiet-warnings                 suppress warning output on stderr\n" +
  "  --print-recipe-source            print detected recipe source to stderr\n" +
  "  --show-summary                   print execution summary to stderr\n" +
  "  --summary-json                   print execution summary as JSON to stderr\n" +
  "  --show-trace                     print human-readable trace to stderr\n" +
  "  --trace-json                     print trace JSON to stderr\n" +
  "  --trace-limit <n>                limit number of trace steps printed\n" +
  "  --show-trace-summary             print trace summary line to stderr\n" +
  "  --trace-summary-json             print trace summary JSON to stderr\n" +
  "  --show-repro                     print compact reproducibility metadata to stderr\n" +
  "  --repro-json                     print reproducibility bundle JSON to stderr\n" +
  "  --repro-file <path>              write reproducibility bundle JSON to file\n" +
  "  --list-ops                       print available operation ids and names\n" +
  "  --list-ops-json                  print available operations as JSON\n" +
  "  --list-ops-filter <query>        filter operation listings by id/name/description\n" +
  "  --input-encoding text|hex|base64 parse CLI input before execution\n" +
  "  --bytes-output hex|base64|utf8   bytes output rendering on stdout\n" +
  "  --hex-uppercase                  render hex bytes output using uppercase letters\n" +
  "  --json-indent <n>                indentation for JSON output rendering\n" +
  "  --output-file <path>             write rendered output to file instead of stdout\n" +
  "  --batch-input-dir <path>         execute recipe for each file in directory and print JSON report\n" +
  "  --batch-ext <list>               comma-separated extension filter for batch inputs (e.g. .txt,.log)\n" +
  "  --batch-report-file <path>       write batch JSON report to file\n" +
  "  --batch-summary-json             print aggregate JSON summary for batch run to stderr\n" +
  "  --batch-output-dir <path>        write per-input rendered outputs to directory\n" +
  "  --batch-fail-fast                stop batch execution on first file error\n" +
  "  --batch-continue-on-error        continue batch execution despite file errors (default)\n" +
  "  --fail-empty-output              fail when rendered output is empty\n" +
  "  --no-newline                     do not append trailing newline to output\n" +
  "  --max-output-chars <n>           limit output length for string/json/bytes rendering\n" +
  "  --version                        print CLI package version\n" +
  "  --help                           print this help text";

function parseRecipeAny(json: string, quietWarnings: boolean): {
  recipe: Recipe;
  source: "native" | "cyberchef";
  warningCount: number;
} {
  try {
    return { recipe: parseRecipe(json), source: "native", warningCount: 0 };
  } catch {
    const imported = importCyberChefRecipe(json);
    if (imported.warnings.length > 0 && !quietWarnings) {
      warn(
        `CyberChef import skipped ${imported.warnings.length} unsupported step(s).`
      );
      for (const w of imported.warnings) {
        warn(`step ${w.step + 1}: ${w.op} (${w.reason})`);
      }
    }
    return {
      recipe: imported.recipe,
      source: "cyberchef",
      warningCount: imported.warnings.length
    };
  }
}

type CliOptions = {
  recipePath: string;
  inputPath?: string;
  timeoutMs: number;
  strictCyberChef: boolean;
  dryRun: boolean;
  failOnWarning: boolean;
  quietWarnings: boolean;
  printRecipeSource: boolean;
  showSummary: boolean;
  summaryJson: boolean;
  showTrace: boolean;
  traceJson: boolean;
  traceLimit?: number;
  showTraceSummary: boolean;
  traceSummaryJson: boolean;
  showRepro: boolean;
  reproJson: boolean;
  reproFile?: string;
  listOps: boolean;
  listOpsJson: boolean;
  listOpsFilter?: string;
  inputEncoding: "text" | "hex" | "base64";
  bytesOutput: "hex" | "base64" | "utf8";
  hexUppercase: boolean;
  jsonIndent: number;
  outputFile?: string;
  batchInputDir?: string;
  batchExt?: string[];
  batchReportFile?: string;
  batchSummaryJson: boolean;
  batchOutputDir?: string;
  batchFailFast: boolean;
  failEmptyOutput: boolean;
  noNewline: boolean;
  maxOutputChars?: number;
};

function parseArgs(args: string[]): CliOptions {
  let timeoutMs = DEFAULT_TIMEOUT_MS;
  let strictCyberChef = false;
  let dryRun = false;
  let failOnWarning = false;
  let quietWarnings = false;
  let printRecipeSource = false;
  let showSummary = false;
  let summaryJson = false;
  let showTrace = false;
  let traceJson = false;
  let traceLimit: number | undefined;
  let showTraceSummary = false;
  let traceSummaryJson = false;
  let showRepro = false;
  let reproJson = false;
  let reproFile: string | undefined;
  let listOps = false;
  let listOpsJson = false;
  let listOpsFilter: string | undefined;
  let inputEncoding: CliOptions["inputEncoding"] = "text";
  let bytesOutput: CliOptions["bytesOutput"] = "hex";
  let hexUppercase = false;
  let jsonIndent = 2;
  let outputFile: string | undefined;
  let batchInputDir: string | undefined;
  let batchExt: string[] | undefined;
  let batchReportFile: string | undefined;
  let batchSummaryJson = false;
  let batchOutputDir: string | undefined;
  let batchFailFast = false;
  let failEmptyOutput = false;
  let noNewline = false;
  let maxOutputChars: number | undefined;
  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;
    if (arg === "--strict-cyberchef") {
      strictCyberChef = true;
      continue;
    }
    if (arg === "--fail-on-warning") {
      failOnWarning = true;
      continue;
    }
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg === "--quiet-warnings") {
      quietWarnings = true;
      continue;
    }
    if (arg === "--print-recipe-source") {
      printRecipeSource = true;
      continue;
    }
    if (arg === "--show-summary") {
      showSummary = true;
      continue;
    }
    if (arg === "--summary-json") {
      summaryJson = true;
      continue;
    }
    if (arg === "--help") {
      process.stdout.write(usageText + "\n");
      process.exit(0);
    }
    if (arg === "--version") {
      process.stdout.write(`${pkg.version}\n`);
      process.exit(0);
    }
    if (arg === "--show-trace") {
      showTrace = true;
      continue;
    }
    if (arg === "--trace-json") {
      traceJson = true;
      continue;
    }
    if (arg === "--show-trace-summary") {
      showTraceSummary = true;
      continue;
    }
    if (arg === "--trace-summary-json") {
      traceSummaryJson = true;
      continue;
    }
    if (arg === "--show-repro") {
      showRepro = true;
      continue;
    }
    if (arg === "--repro-json") {
      reproJson = true;
      continue;
    }
    if (arg === "--repro-file") {
      const raw = args[i + 1];
      if (!raw) die("Missing value for --repro-file");
      reproFile = raw;
      i++;
      continue;
    }
    if (arg === "--trace-limit") {
      const raw = args[i + 1];
      if (!raw) die("Missing value for --trace-limit");
      const parsed = Number(raw);
      if (!Number.isFinite(parsed) || parsed < 0) {
        die(`Invalid --trace-limit value: ${raw}`);
      }
      traceLimit = Math.floor(parsed);
      i++;
      continue;
    }
    if (arg === "--list-ops") {
      listOps = true;
      continue;
    }
    if (arg === "--list-ops-json") {
      listOpsJson = true;
      continue;
    }
    if (arg === "--list-ops-filter") {
      const raw = args[i + 1];
      if (!raw) die("Missing value for --list-ops-filter");
      listOpsFilter = raw;
      i++;
      continue;
    }
    if (arg === "--input-encoding") {
      const raw = args[i + 1];
      if (raw !== "text" && raw !== "hex" && raw !== "base64") {
        die(`Invalid --input-encoding value: ${String(raw)}`);
      }
      inputEncoding = raw;
      i++;
      continue;
    }
    if (arg === "--bytes-output") {
      const raw = args[i + 1];
      if (raw !== "hex" && raw !== "base64" && raw !== "utf8") {
        die(`Invalid --bytes-output value: ${String(raw)}`);
      }
      bytesOutput = raw;
      i++;
      continue;
    }
    if (arg === "--hex-uppercase") {
      hexUppercase = true;
      continue;
    }
    if (arg === "--json-indent") {
      const raw = args[i + 1];
      if (!raw) die("Missing value for --json-indent");
      const parsed = Number(raw);
      if (!Number.isFinite(parsed) || parsed < 0) {
        die(`Invalid --json-indent value: ${raw}`);
      }
      jsonIndent = Math.floor(parsed);
      i++;
      continue;
    }
    if (arg === "--max-output-chars") {
      const raw = args[i + 1];
      if (!raw) die("Missing value for --max-output-chars");
      const parsed = Number(raw);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        die(`Invalid --max-output-chars value: ${raw}`);
      }
      maxOutputChars = Math.floor(parsed);
      i++;
      continue;
    }
    if (arg === "--output-file") {
      const raw = args[i + 1];
      if (!raw) die("Missing value for --output-file");
      outputFile = raw;
      i++;
      continue;
    }
    if (arg === "--batch-input-dir") {
      const raw = args[i + 1];
      if (!raw) die("Missing value for --batch-input-dir");
      batchInputDir = raw;
      i++;
      continue;
    }
    if (arg === "--batch-ext") {
      const raw = args[i + 1];
      if (!raw) die("Missing value for --batch-ext");
      batchExt = raw
        .split(",")
        .map((x) => x.trim().toLowerCase())
        .filter((x) => x.length > 0)
        .map((x) => (x.startsWith(".") ? x : `.${x}`));
      i++;
      continue;
    }
    if (arg === "--batch-report-file") {
      const raw = args[i + 1];
      if (!raw) die("Missing value for --batch-report-file");
      batchReportFile = raw;
      i++;
      continue;
    }
    if (arg === "--batch-summary-json") {
      batchSummaryJson = true;
      continue;
    }
    if (arg === "--batch-output-dir") {
      const raw = args[i + 1];
      if (!raw) die("Missing value for --batch-output-dir");
      batchOutputDir = raw;
      i++;
      continue;
    }
    if (arg === "--batch-fail-fast") {
      batchFailFast = true;
      continue;
    }
    if (arg === "--batch-continue-on-error") {
      batchFailFast = false;
      continue;
    }
    if (arg === "--no-newline") {
      noNewline = true;
      continue;
    }
    if (arg === "--fail-empty-output") {
      failEmptyOutput = true;
      continue;
    }
    if (arg === "--timeout-ms") {
      const raw = args[i + 1];
      if (!raw) die("Missing value for --timeout-ms");
      const parsed = Number(raw);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        die(`Invalid --timeout-ms value: ${raw}`);
      }
      timeoutMs = parsed;
      i++;
      continue;
    }
    if (arg?.startsWith("--")) {
      die(`Unknown option: ${arg}`);
    }
    positional.push(arg);
  }

  const recipePath = positional[0];
  if (!recipePath && !listOps && !listOpsJson) {
    die(usageText);
  }
  const out: CliOptions = {
    recipePath: recipePath ?? "",
    timeoutMs,
    strictCyberChef,
    dryRun,
    failOnWarning,
    quietWarnings,
    printRecipeSource,
    showSummary,
    summaryJson,
    showTrace,
    traceJson,
    showTraceSummary,
    traceSummaryJson,
    showRepro,
    reproJson,
    listOps,
    listOpsJson,
    inputEncoding,
    bytesOutput,
    hexUppercase,
    jsonIndent,
    batchSummaryJson,
    batchFailFast,
    failEmptyOutput,
    noNewline
  };
  if (traceLimit !== undefined) out.traceLimit = traceLimit;
  if (listOpsFilter !== undefined) out.listOpsFilter = listOpsFilter;
  if (outputFile !== undefined) out.outputFile = outputFile;
  if (batchInputDir !== undefined) out.batchInputDir = batchInputDir;
  if (batchExt !== undefined) out.batchExt = batchExt;
  if (batchReportFile !== undefined) out.batchReportFile = batchReportFile;
  if (batchOutputDir !== undefined) out.batchOutputDir = batchOutputDir;
  if (reproFile !== undefined) out.reproFile = reproFile;
  const inputPath = positional[1];
  if (inputPath) out.inputPath = inputPath;
  if (maxOutputChars !== undefined) out.maxOutputChars = maxOutputChars;
  return out;
}

const opts = parseArgs(process.argv.slice(2));

const registry = new InMemoryRegistry();
standardPlugin.register(registry);

if (opts.listOps) {
  const filter = opts.listOpsFilter?.trim().toLowerCase();
  const ops = registry.list().filter((op) =>
    !filter
      ? true
      : op.id.toLowerCase().includes(filter) ||
        op.name.toLowerCase().includes(filter) ||
        op.description.toLowerCase().includes(filter)
  );
  for (const op of ops) {
    process.stdout.write(`${op.id}\t${op.name}\n`);
  }
  process.exit(0);
}
if (opts.listOpsJson) {
  const filter = opts.listOpsFilter?.trim().toLowerCase();
  const ops = registry.list().filter((op) =>
    !filter
      ? true
      : op.id.toLowerCase().includes(filter) ||
        op.name.toLowerCase().includes(filter) ||
        op.description.toLowerCase().includes(filter)
  );
  process.stdout.write(`${JSON.stringify(ops)}\n`);
  process.exit(0);
}

const recipeJson = readFileSync(opts.recipePath, "utf-8");
const parsedRecipe = parseRecipeAny(recipeJson, opts.quietWarnings);
if (opts.printRecipeSource) {
  process.stderr.write(`[info] recipe-source=${parsedRecipe.source}\n`);
}
if (opts.strictCyberChef && parsedRecipe.source === "cyberchef" && parsedRecipe.warningCount > 0) {
  die(
    `Strict CyberChef mode failed: ${parsedRecipe.warningCount} unsupported step(s) were skipped.`
  );
}
if (opts.failOnWarning && parsedRecipe.warningCount > 0) {
  die(`Execution failed due to warnings: ${parsedRecipe.warningCount}`);
}
if (opts.dryRun) {
  process.stderr.write(
    `[dry-run] steps=${parsedRecipe.recipe.steps.length} source=${parsedRecipe.source} warnings=${parsedRecipe.warningCount}\n`
  );
  process.exit(0);
}

function parseInputValue(raw: string): DataValue {
  if (opts.inputEncoding === "hex") return { type: "bytes", value: hexToBytes(raw.trim()) };
  if (opts.inputEncoding === "base64") return { type: "bytes", value: base64ToBytes(raw.trim()) };
  return { type: "string", value: raw };
}

function renderOutput(output: DataValue): string {
  const rendered =
    output.type === "bytes"
      ? (() => {
          let value =
            opts.bytesOutput === "base64"
              ? bytesToBase64(output.value)
              : opts.bytesOutput === "utf8"
                ? bytesToUtf8(output.value)
                : [...output.value].map((b) => b.toString(16).padStart(2, "0")).join("");
          if (opts.bytesOutput === "hex" && opts.hexUppercase) value = value.toUpperCase();
          return value;
        })()
      : output.type === "json"
        ? JSON.stringify(output.value, null, opts.jsonIndent)
        : String(output.value);
  return opts.maxOutputChars !== undefined ? rendered.slice(0, opts.maxOutputChars) : rendered;
}

function fileLeaf(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] ?? path;
}

async function executeOne(rawInput: string): Promise<{
  rendered: string;
  elapsed: number;
  outputType: DataValue["type"];
  trace: Awaited<ReturnType<typeof runRecipe>>["trace"];
  traceSummary: ReturnType<typeof summarizeTrace>;
  reproBundle: {
    runId: string;
    startedAt: number;
    endedAt: number;
    durationMs: number;
    recipeHash: string;
    inputHash: string;
    recipeSource: "native" | "cyberchef";
    warningCount: number;
    traceSteps: number;
    outputType: DataValue["type"];
    pluginSet: Array<{ pluginId: string; version: string }>;
  };
}> {
  const inputValue = parseInputValue(rawInput);
  const controller = new AbortController();
  const startedAt = Date.now();
  const timeoutHandle = setTimeout(() => {
    controller.abort();
  }, opts.timeoutMs);
  const res = await runRecipe({
    registry,
    recipe: parsedRecipe.recipe,
    input: inputValue,
    signal: controller.signal
  }).finally(() => {
    clearTimeout(timeoutHandle);
  });
  const recipeHash = await hashRecipe(parsedRecipe.recipe);
  const inputHash = await hashDataValue(inputValue);
  const elapsed = Date.now() - startedAt;
  const traceSummary = summarizeTrace(res.trace);
  const reproBundle = {
    runId: crypto.randomUUID(),
    startedAt,
    endedAt: startedAt + elapsed,
    durationMs: elapsed,
    recipeHash,
    inputHash,
    recipeSource: parsedRecipe.source,
    warningCount: parsedRecipe.warningCount,
    traceSteps: res.trace.length,
    outputType: res.output.type,
    pluginSet: [{ pluginId: standardPlugin.pluginId, version: standardPlugin.version }]
  };
  return {
    rendered: renderOutput(res.output),
    elapsed,
    outputType: res.output.type,
    trace: res.trace,
    traceSummary,
    reproBundle
  };
}

if (opts.batchInputDir) {
  const entries = readdirSync(opts.batchInputDir)
    .map((name) => `${opts.batchInputDir as string}/${name}`)
    .filter((name) =>
      !opts.batchExt || opts.batchExt.length === 0
        ? true
        : opts.batchExt.some((ext) => name.toLowerCase().endsWith(ext))
    )
    .sort();
  const report: Array<{
    file: string;
    ok: boolean;
    durationMs: number;
    outputType: DataValue["type"];
    outputPreview?: string;
    traceSummary?: ReturnType<typeof summarizeTrace>;
    recipeHash?: string;
    inputHash?: string;
    error?: string;
  }> = [];
  for (const filePath of entries) {
    try {
      const raw = readFileSync(filePath, "utf-8");
      const run = await executeOne(raw);
      report.push({
        file: filePath,
        ok: true,
        durationMs: run.elapsed,
        outputType: run.outputType,
        outputPreview: run.rendered,
        traceSummary: run.traceSummary,
        recipeHash: run.reproBundle.recipeHash,
        inputHash: run.reproBundle.inputHash
      });
      if (opts.batchOutputDir) {
        const outPath = `${opts.batchOutputDir}/${fileLeaf(filePath)}.out.txt`;
        writeFileSync(outPath, `${run.rendered}\n`, "utf-8");
      }
    } catch {
      report.push({
        file: filePath,
        ok: false,
        durationMs: 0,
        outputType: "string",
        error: "Failed to read or process input file"
      });
      if (opts.batchFailFast) {
        break;
      }
    }
  }
  if (opts.batchSummaryJson) {
    const durations = report.filter((r) => r.ok).map((r) => r.durationMs).sort((a, b) => a - b);
    const pickPercentile = (p: number): number => {
      if (durations.length === 0) return 0;
      const idx = Math.min(durations.length - 1, Math.max(0, Math.floor((durations.length - 1) * p)));
      return durations[idx] ?? 0;
    };
    const total = durations.reduce((acc, v) => acc + v, 0);
    const summary = {
      filesTotal: report.length,
      filesOk: report.filter((r) => r.ok).length,
      filesFailed: report.filter((r) => !r.ok).length,
      durationMs: {
        min: durations.length > 0 ? durations[0] : 0,
        max: durations.length > 0 ? durations[durations.length - 1] : 0,
        avg: durations.length > 0 ? total / durations.length : 0,
        p50: pickPercentile(0.5),
        p95: pickPercentile(0.95)
      }
    };
    process.stderr.write(`${JSON.stringify(summary)}\n`);
  }
  const payload = `${JSON.stringify(report, null, 2)}\n`;
  if (opts.batchReportFile) {
    writeFileSync(opts.batchReportFile, payload, "utf-8");
  }
  process.stdout.write(payload);
  process.exit(0);
}

const input =
  opts.inputPath && opts.inputPath !== "-"
    ? readFileSync(opts.inputPath, "utf-8")
    : readFileSync(0, "utf-8");
const run = await executeOne(input);

if (opts.showSummary) {
  process.stderr.write(
    `[summary] outputType=${run.outputType} traceSteps=${run.trace.length} durationMs=${run.elapsed}\n`
  );
}
if (opts.summaryJson) {
  process.stderr.write(
    `${JSON.stringify({ outputType: run.outputType, traceSteps: run.trace.length, durationMs: run.elapsed })}\n`
  );
}
if (opts.showRepro) {
  process.stderr.write(
    `[repro] recipeHash=${run.reproBundle.recipeHash} inputHash=${run.reproBundle.inputHash} durationMs=${run.reproBundle.durationMs}\n`
  );
}
if (opts.reproJson) {
  process.stderr.write(`${JSON.stringify(run.reproBundle)}\n`);
}
if (opts.reproFile) {
  writeFileSync(opts.reproFile, `${JSON.stringify(run.reproBundle, null, 2)}\n`, "utf-8");
}
if (opts.showTrace) {
  const traceRows = opts.traceLimit !== undefined ? run.trace.slice(0, opts.traceLimit) : run.trace;
  for (const t of traceRows) {
    process.stderr.write(
      `[trace] step=${t.step + 1} op=${t.opId} ${t.inputType}->${t.outputType}\n`
    );
  }
}
if (opts.traceJson) {
  const traceRows = opts.traceLimit !== undefined ? run.trace.slice(0, opts.traceLimit) : run.trace;
  process.stderr.write(`${JSON.stringify(traceRows)}\n`);
}
if (opts.showTraceSummary) {
  process.stderr.write(
    `[trace-summary] steps=${run.traceSummary.steps} totalMs=${run.traceSummary.totalDurationMs} avgMs=${run.traceSummary.averageDurationMs.toFixed(2)} slowest=${run.traceSummary.slowestStep ? `${run.traceSummary.slowestStep.step + 1}:${run.traceSummary.slowestStep.opId}:${run.traceSummary.slowestStep.durationMs}` : "none"}\n`
  );
}
if (opts.traceSummaryJson) {
  process.stderr.write(`${JSON.stringify(run.traceSummary)}\n`);
}
if (opts.failEmptyOutput && run.rendered.length === 0) {
  die("Execution failed: output is empty.");
}
if (opts.outputFile) {
  writeFileSync(opts.outputFile, opts.noNewline ? run.rendered : `${run.rendered}\n`, "utf-8");
} else {
  process.stdout.write(opts.noNewline ? run.rendered : run.rendered + "\n");
}
