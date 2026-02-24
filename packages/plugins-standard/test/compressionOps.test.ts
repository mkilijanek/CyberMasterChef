import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { gzip } from "../src/ops/gzip.js";
import { gunzip } from "../src/ops/gunzip.js";

describe("compression operations", () => {
  it("round-trips UTF-8 content through gzip/gunzip", async () => {
    const registry = new InMemoryRegistry();
    registry.register(gzip);
    registry.register(gunzip);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "compression.gzip" }, { opId: "compression.gunzip" }]
    };
    const input = "CyberMasterChef compression baseline: gzip/gunzip";
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: input }
    });

    expect(out.output.type).toBe("bytes");
    if (out.output.type !== "bytes") return;
    const decoded = new TextDecoder().decode(out.output.value);
    expect(decoded).toBe(input);
  });

  it("returns deterministic gzip bytes for the same input", async () => {
    const registry = new InMemoryRegistry();
    registry.register(gzip);
    const recipe: Recipe = { version: 1, steps: [{ opId: "compression.gzip" }] };
    const input = { type: "string", value: "deterministic gzip fixture" } as const;
    const run1 = await runRecipe({ registry, recipe, input });
    const run2 = await runRecipe({ registry, recipe, input });
    expect(run1.output.type).toBe("bytes");
    expect(run2.output.type).toBe("bytes");
    if (run1.output.type !== "bytes" || run2.output.type !== "bytes") return;
    expect(Array.from(run1.output.value)).toEqual(Array.from(run2.output.value));
  });

  it("fails gracefully on invalid gzip bytes", async () => {
    const registry = new InMemoryRegistry();
    registry.register(gunzip);
    const recipe: Recipe = { version: 1, steps: [{ opId: "compression.gunzip" }] };
    await expect(
      runRecipe({
        registry,
        recipe,
        input: { type: "bytes", value: new Uint8Array([0x00, 0x01, 0x02, 0x03]) }
      })
    ).rejects.toThrow("Failed to gunzip input");
  });
});
