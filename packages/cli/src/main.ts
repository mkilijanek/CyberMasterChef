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
import { readFileSync, writeFileSync } from "node:fs";
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
    failEmptyOutput,
    noNewline
  };
  if (traceLimit !== undefined) out.traceLimit = traceLimit;
  if (listOpsFilter !== undefined) out.listOpsFilter = listOpsFilter;
  if (outputFile !== undefined) out.outputFile = outputFile;
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
const input =
  opts.inputPath && opts.inputPath !== "-"
    ? readFileSync(opts.inputPath, "utf-8")
    : readFileSync(0, "utf-8");
const inputValue: DataValue =
  opts.inputEncoding === "hex"
    ? { type: "bytes", value: hexToBytes(input.trim()) }
    : opts.inputEncoding === "base64"
      ? { type: "bytes", value: base64ToBytes(input.trim()) }
      : { type: "string", value: input };

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
  pluginSet: [
    {
      pluginId: standardPlugin.pluginId,
      version: standardPlugin.version
    }
  ]
};
const traceSummary = summarizeTrace(res.trace);
if (opts.showSummary) {
  process.stderr.write(
    `[summary] outputType=${res.output.type} traceSteps=${res.trace.length} durationMs=${elapsed}\n`
  );
}
if (opts.summaryJson) {
  process.stderr.write(
    `${JSON.stringify({ outputType: res.output.type, traceSteps: res.trace.length, durationMs: elapsed })}\n`
  );
}
if (opts.showRepro) {
  process.stderr.write(
    `[repro] recipeHash=${reproBundle.recipeHash} inputHash=${reproBundle.inputHash} durationMs=${reproBundle.durationMs}\n`
  );
}
if (opts.reproJson) {
  process.stderr.write(`${JSON.stringify(reproBundle)}\n`);
}
if (opts.reproFile) {
  writeFileSync(opts.reproFile, `${JSON.stringify(reproBundle, null, 2)}\n`, "utf-8");
}

if (opts.showTrace) {
  const traceRows = opts.traceLimit !== undefined ? res.trace.slice(0, opts.traceLimit) : res.trace;
  for (const t of traceRows) {
    process.stderr.write(
      `[trace] step=${t.step + 1} op=${t.opId} ${t.inputType}->${t.outputType}\n`
    );
  }
}
if (opts.traceJson) {
  const traceRows = opts.traceLimit !== undefined ? res.trace.slice(0, opts.traceLimit) : res.trace;
  process.stderr.write(`${JSON.stringify(traceRows)}\n`);
}
if (opts.showTraceSummary) {
  process.stderr.write(
    `[trace-summary] steps=${traceSummary.steps} totalMs=${traceSummary.totalDurationMs} avgMs=${traceSummary.averageDurationMs.toFixed(2)} slowest=${traceSummary.slowestStep ? `${traceSummary.slowestStep.step + 1}:${traceSummary.slowestStep.opId}:${traceSummary.slowestStep.durationMs}` : "none"}\n`
  );
}
if (opts.traceSummaryJson) {
  process.stderr.write(`${JSON.stringify(traceSummary)}\n`);
}

let rendered = "";
if (res.output.type === "bytes") {
  rendered =
    opts.bytesOutput === "base64"
      ? bytesToBase64(res.output.value)
      : opts.bytesOutput === "utf8"
        ? bytesToUtf8(res.output.value)
        : [...res.output.value].map((b) => b.toString(16).padStart(2, "0")).join("");
  if (opts.bytesOutput === "hex" && opts.hexUppercase) {
    rendered = rendered.toUpperCase();
  }
} else if (res.output.type === "json") {
  rendered = JSON.stringify(res.output.value, null, opts.jsonIndent);
} else {
  rendered = String(res.output.value);
}
const printed =
  opts.maxOutputChars !== undefined ? rendered.slice(0, opts.maxOutputChars) : rendered;
if (opts.failEmptyOutput && printed.length === 0) {
  die("Execution failed: output is empty.");
}
if (opts.outputFile) {
  writeFileSync(opts.outputFile, opts.noNewline ? printed : `${printed}\n`, "utf-8");
} else {
  process.stdout.write(opts.noNewline ? printed : printed + "\n");
}
