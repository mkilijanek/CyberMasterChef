#!/usr/bin/env node
import {
  InMemoryRegistry,
  runRecipe,
  parseRecipe,
  importCyberChefRecipe,
  base64ToBytes,
  bytesToBase64,
  bytesToUtf8,
  hexToBytes,
  type DataValue,
  type Recipe
} from "@cybermasterchef/core";
import { standardPlugin } from "@cybermasterchef/plugins-standard";
import fs from "node:fs";
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
  "Usage: cybermasterchef <recipe.json> [input.txt] [options]\n" +
  "  Reads input from stdin if [input.txt] is omitted.\n" +
  "Options:\n" +
  "  --timeout-ms <n>                  execution timeout in milliseconds\n" +
  "  --strict-cyberchef               fail if CyberChef import skips steps\n" +
  "  --fail-on-warning                fail if import warnings are emitted\n" +
  "  --quiet-warnings                 suppress warning output on stderr\n" +
  "  --print-recipe-source            print detected recipe source to stderr\n" +
  "  --show-summary                   print execution summary to stderr\n" +
  "  --show-trace                     print human-readable trace to stderr\n" +
  "  --trace-json                     print trace JSON to stderr\n" +
  "  --list-ops                       print available operation ids and names\n" +
  "  --list-ops-json                  print available operations as JSON\n" +
  "  --input-encoding text|hex|base64 parse CLI input before execution\n" +
  "  --bytes-output hex|base64|utf8   bytes output rendering on stdout\n" +
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
  failOnWarning: boolean;
  quietWarnings: boolean;
  printRecipeSource: boolean;
  showSummary: boolean;
  showTrace: boolean;
  traceJson: boolean;
  listOps: boolean;
  listOpsJson: boolean;
  inputEncoding: "text" | "hex" | "base64";
  bytesOutput: "hex" | "base64" | "utf8";
  maxOutputChars?: number;
};

function parseArgs(args: string[]): CliOptions {
  let timeoutMs = DEFAULT_TIMEOUT_MS;
  let strictCyberChef = false;
  let failOnWarning = false;
  let quietWarnings = false;
  let printRecipeSource = false;
  let showSummary = false;
  let showTrace = false;
  let traceJson = false;
  let listOps = false;
  let listOpsJson = false;
  let inputEncoding: CliOptions["inputEncoding"] = "text";
  let bytesOutput: CliOptions["bytesOutput"] = "hex";
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
    if (arg === "--list-ops") {
      listOps = true;
      continue;
    }
    if (arg === "--list-ops-json") {
      listOpsJson = true;
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
    failOnWarning,
    quietWarnings,
    printRecipeSource,
    showSummary,
    showTrace,
    traceJson,
    listOps,
    listOpsJson,
    inputEncoding,
    bytesOutput
  };
  const inputPath = positional[1];
  if (inputPath) out.inputPath = inputPath;
  if (maxOutputChars !== undefined) out.maxOutputChars = maxOutputChars;
  return out;
}

const opts = parseArgs(process.argv.slice(2));

const registry = new InMemoryRegistry();
standardPlugin.register(registry);

if (opts.listOps) {
  for (const op of registry.list()) {
    process.stdout.write(`${op.id}\t${op.name}\n`);
  }
  process.exit(0);
}
if (opts.listOpsJson) {
  process.stdout.write(`${JSON.stringify(registry.list())}\n`);
  process.exit(0);
}

const recipeJson = fs.readFileSync(opts.recipePath, "utf-8");
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
const input = opts.inputPath ? fs.readFileSync(opts.inputPath, "utf-8") : fs.readFileSync(0, "utf-8");
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
if (opts.showSummary) {
  const elapsed = Date.now() - startedAt;
  process.stderr.write(
    `[summary] outputType=${res.output.type} traceSteps=${res.trace.length} durationMs=${elapsed}\n`
  );
}

if (opts.showTrace) {
  for (const t of res.trace) {
    process.stderr.write(
      `[trace] step=${t.step + 1} op=${t.opId} ${t.inputType}->${t.outputType}\n`
    );
  }
}
if (opts.traceJson) {
  process.stderr.write(`${JSON.stringify(res.trace)}\n`);
}

if (res.output.type === "bytes") {
  const out =
    opts.bytesOutput === "base64"
      ? bytesToBase64(res.output.value)
      : opts.bytesOutput === "utf8"
        ? bytesToUtf8(res.output.value)
        : [...res.output.value].map((b) => b.toString(16).padStart(2, "0")).join("");
  const printed =
    opts.maxOutputChars !== undefined ? out.slice(0, opts.maxOutputChars) : out;
  process.stdout.write(printed + "\n");
} else if (res.output.type === "json") {
  const out = JSON.stringify(res.output.value, null, 2);
  const printed =
    opts.maxOutputChars !== undefined ? out.slice(0, opts.maxOutputChars) : out;
  process.stdout.write(printed + "\n");
} else {
  const out = String(res.output.value);
  const printed =
    opts.maxOutputChars !== undefined ? out.slice(0, opts.maxOutputChars) : out;
  process.stdout.write(printed + "\n");
}
