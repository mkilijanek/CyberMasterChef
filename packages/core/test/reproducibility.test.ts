import { afterEach, describe, expect, it, vi } from "vitest";
import { canonicalizeDataValue, canonicalizeRecipe, hashDataValue, hashRecipe } from "../src/reproducibility.js";
import type { Recipe } from "../src/types.js";

describe("reproducibility", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

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

  it("falls back when WebCrypto subtle is unavailable", async () => {
    vi.stubGlobal("crypto", {});
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "text.reverse" }]
    };
    await expect(hashRecipe(recipe)).resolves.toBe(
      "c587d66d406c20073b24457cd0ae62bd08e2b3ff664b20f4b7813cb9ec2a84b4"
    );
    await expect(hashDataValue({ type: "string", value: "abc" })).resolves.toBe(
      "1bc16e572f0620a647f57f130b1a9bec79ebf9fd3c8b381473954b21ed8c26ee"
    );
  });
});
