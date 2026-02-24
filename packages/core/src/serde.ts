import type { Recipe } from "./types.js";

type CyberChefStep = {
  op: string;
  args?: unknown[];
};

type CyberChefRecipeContainer = {
  recipe: CyberChefStep[];
};

export type RecipeImportWarning = {
  step: number;
  op: string;
  reason: string;
};

const cyberChefToNativeMap: Record<string, string> = {
  "To Base64": "codec.toBase64",
  "From Base64": "codec.fromBase64",
  "To Hex": "codec.toHex",
  "From Hex": "codec.fromHex",
  "To Binary": "codec.toBinary",
  "From Binary": "codec.fromBinary",
  "URL Encode": "codec.urlEncode",
  "URL Decode": "codec.urlDecode",
  "SHA2-256": "hash.sha256",
  Reverse: "text.reverse"
};

const nativeToCyberChefMap: Record<string, string> = Object.fromEntries(
  Object.entries(cyberChefToNativeMap).map(([k, v]) => [v, k])
);

export function emptyRecipe(): Recipe {
  return { version: 1, steps: [] };
}

export function parseRecipe(json: string): Recipe {
  const x = JSON.parse(json) as unknown;
  if (typeof x !== "object" || x === null) {
    throw new Error("Invalid recipe format");
  }
  if ((x as { version?: unknown }).version !== 1) throw new Error("Invalid recipe format");
  const steps = (x as { steps?: unknown }).steps;
  if (!Array.isArray(steps)) throw new Error("Invalid recipe format");
  for (const step of steps) {
    if (typeof step !== "object" || step === null) throw new Error("Invalid recipe step");
    const s = step as { opId?: unknown; args?: unknown };
    if (typeof s.opId !== "string" || s.opId.length === 0) {
      throw new Error("Invalid recipe step");
    }
    if (s.args !== undefined && (typeof s.args !== "object" || s.args === null)) {
      throw new Error("Invalid recipe step args");
    }
  }
  return x as Recipe;
}

export function stringifyRecipe(recipe: Recipe): string {
  return JSON.stringify(recipe, null, 2);
}

function parseCyberChefRecipePayload(x: unknown): CyberChefStep[] {
  if (Array.isArray(x)) return x as CyberChefStep[];
  if (typeof x === "object" && x !== null && Array.isArray((x as CyberChefRecipeContainer).recipe)) {
    return (x as CyberChefRecipeContainer).recipe;
  }
  throw new Error("Invalid CyberChef recipe format");
}

export function importCyberChefRecipe(json: string): {
  recipe: Recipe;
  warnings: RecipeImportWarning[];
} {
  const parsed = JSON.parse(json) as unknown;
  const sourceSteps = parseCyberChefRecipePayload(parsed);
  const warnings: RecipeImportWarning[] = [];
  const steps: Recipe["steps"] = [];

  for (let i = 0; i < sourceSteps.length; i++) {
    const step = sourceSteps[i];
    if (!step || typeof step !== "object") {
      warnings.push({ step: i, op: "<unknown>", reason: "Invalid step payload" });
      continue;
    }
    const op = typeof step.op === "string" ? step.op : "";
    if (!op) {
      warnings.push({ step: i, op: "<unknown>", reason: "Missing operation name" });
      continue;
    }

    const mapped = cyberChefToNativeMap[op];
    if (!mapped) {
      warnings.push({ step: i, op, reason: "Unsupported operation" });
      continue;
    }

    const args: Record<string, unknown> = {};
    const rawArgs = Array.isArray(step.args) ? step.args : [];
    if (mapped === "codec.toBinary" && rawArgs.length > 0 && typeof rawArgs[0] === "string") {
      args.delimiter = rawArgs[0];
    }

    steps.push({ opId: mapped, args });
  }

  if (steps.length === 0) {
    throw new Error("No compatible operations found in imported CyberChef recipe");
  }

  return { recipe: { version: 1, steps }, warnings };
}

export function exportCyberChefRecipe(recipe: Recipe): string {
  const out: CyberChefRecipeContainer = {
    recipe: recipe.steps.map((step) => {
      const op = nativeToCyberChefMap[step.opId] ?? step.opId;
      if (step.opId === "codec.toBinary") {
        const delimiter =
          typeof step.args?.delimiter === "string" ? step.args.delimiter : " ";
        return { op, args: [delimiter] };
      }
      return { op, args: [] };
    })
  };
  return JSON.stringify(out, null, 2);
}
