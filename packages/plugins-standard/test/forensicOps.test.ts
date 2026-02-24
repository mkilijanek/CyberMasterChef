import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { extractStrings } from "../src/ops/extractStrings.js";

describe("forensic operations", () => {
  it("extracts printable strings from bytes", async () => {
    const registry = new InMemoryRegistry();
    registry.register(extractStrings);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "forensic.extractStrings", args: { minLength: 3 } }]
    };
    const bytes = new Uint8Array([0, 65, 66, 67, 68, 1, 120, 121, 122, 0, 49, 50, 51, 52]);
    const out = await runRecipe({ registry, recipe, input: { type: "bytes", value: bytes } });
    expect(out.output).toEqual({ type: "string", value: "ABCD\nxyz\n1234" });
  });

  it("extracts printable strings from string input", async () => {
    const registry = new InMemoryRegistry();
    registry.register(extractStrings);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "forensic.extractStrings", args: { minLength: 3 } }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "\u0000abc\u0000de\u0000WXYZ" }
    });
    expect(out.output).toEqual({ type: "string", value: "abc\nWXYZ" });
  });
});
