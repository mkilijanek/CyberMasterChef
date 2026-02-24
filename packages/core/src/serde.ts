import type { Recipe } from "./types.js";

export function emptyRecipe(): Recipe {
  return { version: 1, steps: [] };
}

export function parseRecipe(json: string): Recipe {
  const x = JSON.parse(json) as unknown;
  if (
    typeof x !== "object" ||
    x === null ||
    (x as { version?: unknown }).version !== 1 ||
    !Array.isArray((x as { steps?: unknown }).steps)
  ) {
    throw new Error("Invalid recipe format");
  }
  return x as Recipe;
}

export function stringifyRecipe(recipe: Recipe): string {
  return JSON.stringify(recipe, null, 2);
}
