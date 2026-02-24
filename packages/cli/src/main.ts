#!/usr/bin/env node
import {
  InMemoryRegistry,
  runRecipe,
  parseRecipe,
  importCyberChefRecipe,
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
};

function parseArgs(args: string[]): CliOptions {
  let timeoutMs = DEFAULT_TIMEOUT_MS;
  let strictCyberChef = false;
  let showTrace = false;
  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;
    if (arg === "--strict-cyberchef") {
      strictCyberChef = true;
      continue;
    }
    if (arg === "--show-trace") {
      showTrace = true;
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
    die(
      "Usage: cybermasterchef <recipe.json> [input.txt] [--timeout-ms <n>] [--strict-cyberchef]\n" +
        "  Reads input from stdin if [input.txt] is omitted."
    );
  }
  const out: CliOptions = {
    recipePath,
    timeoutMs,
    strictCyberChef,
    showTrace
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

const registry = new InMemoryRegistry();
standardPlugin.register(registry);

const controller = new AbortController();
const timeoutHandle = setTimeout(() => {
  controller.abort();
}, opts.timeoutMs);
const res = await runRecipe({
  registry,
  recipe: parsedRecipe.recipe,
  input: { type: "string", value: input },
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

if (res.output.type === "bytes") {
  const hex = [...res.output.value].map((b) => b.toString(16).padStart(2, "0")).join("");
  process.stdout.write(hex + "\n");
} else if (res.output.type === "json") {
  process.stdout.write(JSON.stringify(res.output.value, null, 2) + "\n");
} else {
  process.stdout.write(String(res.output.value) + "\n");
}
