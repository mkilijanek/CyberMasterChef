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
  "  --show-trace                     print human-readable trace to stderr\n" +
  "  --trace-json                     print trace JSON to stderr\n" +
  "  --input-encoding text|hex|base64 parse CLI input before execution\n" +
  "  --bytes-output hex|base64|utf8   bytes output rendering on stdout\n" +
  "  --help                           print this help text";

function parseRecipeAny(json: string): {
  recipe: Recipe;
  source: "native" | "cyberchef";
  warningCount: number;
} {
  try {
    return { recipe: parseRecipe(json), source: "native", warningCount: 0 };
  } catch {
    const imported = importCyberChefRecipe(json);
    if (imported.warnings.length > 0) {
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
  showTrace: boolean;
  traceJson: boolean;
  inputEncoding: "text" | "hex" | "base64";
  bytesOutput: "hex" | "base64" | "utf8";
};

function parseArgs(args: string[]): CliOptions {
  let timeoutMs = DEFAULT_TIMEOUT_MS;
  let strictCyberChef = false;
  let showTrace = false;
  let traceJson = false;
  let inputEncoding: CliOptions["inputEncoding"] = "text";
  let bytesOutput: CliOptions["bytesOutput"] = "hex";
  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;
    if (arg === "--strict-cyberchef") {
      strictCyberChef = true;
      continue;
    }
    if (arg === "--help") {
      process.stdout.write(usageText + "\n");
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
  if (!recipePath) {
    die(usageText);
  }
  const out: CliOptions = {
    recipePath,
    timeoutMs,
    strictCyberChef,
    showTrace,
    traceJson,
    inputEncoding,
    bytesOutput
  };
  const inputPath = positional[1];
  if (inputPath) out.inputPath = inputPath;
  return out;
}

const opts = parseArgs(process.argv.slice(2));

const recipeJson = fs.readFileSync(opts.recipePath, "utf-8");
const parsedRecipe = parseRecipeAny(recipeJson);
if (opts.strictCyberChef && parsedRecipe.source === "cyberchef" && parsedRecipe.warningCount > 0) {
  die(
    `Strict CyberChef mode failed: ${parsedRecipe.warningCount} unsupported step(s) were skipped.`
  );
}
const input = opts.inputPath ? fs.readFileSync(opts.inputPath, "utf-8") : fs.readFileSync(0, "utf-8");
const inputValue: DataValue =
  opts.inputEncoding === "hex"
    ? { type: "bytes", value: hexToBytes(input.trim()) }
    : opts.inputEncoding === "base64"
      ? { type: "bytes", value: base64ToBytes(input.trim()) }
      : { type: "string", value: input };

const registry = new InMemoryRegistry();
standardPlugin.register(registry);

const controller = new AbortController();
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
  process.stdout.write(out + "\n");
} else if (res.output.type === "json") {
  process.stdout.write(JSON.stringify(res.output.value, null, 2) + "\n");
} else {
  process.stdout.write(String(res.output.value) + "\n");
}
