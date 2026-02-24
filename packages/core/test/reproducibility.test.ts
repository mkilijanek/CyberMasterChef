import { describe, expect, it } from "vitest";
import { canonicalizeDataValue, canonicalizeRecipe, hashDataValue, hashRecipe } from "../src/reproducibility.js";
import type { Recipe } from "../src/types.js";

describe("reproducibility", () => {
  it("canonicalizes recipe args regardless of key order", () => {
    const a: Recipe = {
      version: 1,
      steps: [{ opId: "text.replace", args: { replace: "y", find: "x" } }]
    };
    const b: Recipe = {
      version: 1,
      steps: [{ opId: "text.replace", args: { find: "x", replace: "y" } }]
    };
    expect(canonicalizeRecipe(a)).toBe(canonicalizeRecipe(b));
  });

  it("hashes semantically equal recipes to the same value", async () => {
    const a: Recipe = {
      version: 1,
      steps: [{ opId: "text.replace", args: { replace: "y", find: "x" } }]
    };
    const b: Recipe = {
      version: 1,
      steps: [{ opId: "text.replace", args: { find: "x", replace: "y" } }]
    };
    expect(await hashRecipe(a)).toBe(await hashRecipe(b));
  });

  it("canonicalizes bytes values as stable hex payload", () => {
    const payload = canonicalizeDataValue({
      type: "bytes",
      value: new Uint8Array([0, 255, 16])
    });
    expect(payload).toContain("\"valueHex\":\"00ff10\"");
  });

  it("produces stable input hash for identical values", async () => {
    const v = { type: "string", value: "abc" } as const;
    const h1 = await hashDataValue(v);
    const h2 = await hashDataValue(v);
    expect(h1).toBe(h2);
  });
});
