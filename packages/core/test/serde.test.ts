import { describe, expect, it } from "vitest";
import {
  emptyRecipe,
  exportCyberChefRecipe,
  importCyberChefRecipe,
  parseRecipe
} from "../src/serde.js";

describe("serde", () => {
  it("parses valid native recipe", () => {
    const recipe = parseRecipe(JSON.stringify({ version: 1, steps: [] }));
    expect(recipe).toEqual(emptyRecipe());
  });

  it("imports CyberChef recipe with supported and unsupported steps", () => {
    const source = {
      recipe: [
        { op: "To Base64", args: [] },
        { op: "To Binary", args: ["-"] },
        { op: "Not Implemented", args: [] }
      ]
    };
    const imported = importCyberChefRecipe(JSON.stringify(source));

    expect(imported.recipe.steps).toEqual([
      { opId: "codec.toBase64", args: {} },
      { opId: "codec.toBinary", args: { delimiter: "-" } }
    ]);
    expect(imported.warnings).toHaveLength(1);
    expect(imported.warnings[0]?.op).toBe("Not Implemented");
  });

  it("keeps original step indexes in CyberChef import warnings", () => {
    const source = {
      recipe: [
        { op: "To Base64", args: [] },
        { op: "Unknown #1", args: [] },
        { op: "Unknown #2", args: [] }
      ]
    };
    const imported = importCyberChefRecipe(JSON.stringify(source));

    expect(imported.warnings).toEqual([
      { step: 1, op: "Unknown #1", reason: "Unsupported operation" },
      { step: 2, op: "Unknown #2", reason: "Unsupported operation" }
    ]);
  });

  it("exports native recipe to CyberChef-compatible format", () => {
    const out = exportCyberChefRecipe({
      version: 1,
      steps: [
        { opId: "codec.toBase64", args: {} },
        { opId: "codec.toBinary", args: { delimiter: "|" } }
      ]
    });
    const parsed = JSON.parse(out) as { recipe: Array<{ op: string; args: unknown[] }> };

    expect(parsed.recipe[0]).toEqual({ op: "To Base64", args: [] });
    expect(parsed.recipe[1]).toEqual({ op: "To Binary", args: ["|"] });
  });

  it("round-trips selected operations via CyberChef format", () => {
    const native: Parameters<typeof exportCyberChefRecipe>[0] = {
      version: 1,
      steps: [
        { opId: "codec.toHex", args: {} },
        { opId: "codec.fromHex", args: {} },
        { opId: "text.reverse", args: {} }
      ]
    };
    const exported = exportCyberChefRecipe(native);
    const imported = importCyberChefRecipe(exported);

    expect(imported.warnings).toEqual([]);
    expect(imported.recipe).toEqual(native);
  });
});
