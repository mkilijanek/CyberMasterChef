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

function die(msg: string): never {
  process.stderr.write(msg + "\n");
  process.exit(1);
}

function warn(msg: string): void {
  process.stderr.write(`[warn] ${msg}\n`);
}

function parseRecipeAny(json: string): Recipe {
  try {
    return parseRecipe(json);
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
    return imported.recipe;
  }
}

const args = process.argv.slice(2);
const recipePath = args[0];
const inputPath = args[1];

if (!recipePath) {
  die("Usage: cybermasterchef <recipe.json> [input.txt]\n  Reads input from stdin if [input.txt] is omitted.");
}

const recipeJson = fs.readFileSync(recipePath, "utf-8");
const recipe = parseRecipeAny(recipeJson);
const input = inputPath ? fs.readFileSync(inputPath, "utf-8") : fs.readFileSync(0, "utf-8");

const registry = new InMemoryRegistry();
standardPlugin.register(registry);

const res = await runRecipe({
  registry,
  recipe,
  input: { type: "string", value: input }
});

if (res.output.type === "bytes") {
  const hex = [...res.output.value].map((b) => b.toString(16).padStart(2, "0")).join("");
  process.stdout.write(hex + "\n");
} else if (res.output.type === "json") {
  process.stdout.write(JSON.stringify(res.output.value, null, 2) + "\n");
} else {
  process.stdout.write(String(res.output.value) + "\n");
}
