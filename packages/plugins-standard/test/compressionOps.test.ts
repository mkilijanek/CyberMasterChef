import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { gzip } from "../src/ops/gzip.js";
import { gunzip } from "../src/ops/gunzip.js";
import { bzip2Compress } from "../src/ops/bzip2Compress.js";
import { bzip2Decompress } from "../src/ops/bzip2Decompress.js";
import { zip } from "../src/ops/zip.js";
import { unzip } from "../src/ops/unzip.js";
import { tar } from "../src/ops/tar.js";
import { untar } from "../src/ops/untar.js";

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

  it("round-trips content through bzip2", async () => {
    const registry = new InMemoryRegistry();
    registry.register(bzip2Compress);
    registry.register(bzip2Decompress);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "compression.bzip2" }, { opId: "compression.bzip2Decompress" }]
    };
    const input = "CyberMasterChef bzip2 baseline";
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

  it("creates and extracts zip archives", async () => {
    const registry = new InMemoryRegistry();
    registry.register(zip);
    registry.register(unzip);
    const recipe: Recipe = {
      version: 1,
      steps: [
        { opId: "compression.zip", args: { filename: "note.txt" } },
        { opId: "compression.unzip" }
      ]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "zip payload" }
    });

    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    const entries = (out.output.value as { entries: Array<{ name: string; base64: string }> })
      .entries;
    expect(entries.length).toBeGreaterThan(0);
    const first = entries[0]!;
    expect(first.name).toBe("note.txt");
    const decoded = Buffer.from(first.base64, "base64").toString("utf-8");
    expect(decoded).toBe("zip payload");
  });

  it("creates and extracts tar archives", async () => {
    const registry = new InMemoryRegistry();
    registry.register(tar);
    registry.register(untar);
    const recipe: Recipe = {
      version: 1,
      steps: [
        { opId: "compression.tar", args: { filename: "note.txt" } },
        { opId: "compression.untar" }
      ]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "tar payload" }
    });

    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    const entries = (out.output.value as { entries: Array<{ name: string; base64: string }> })
      .entries;
    expect(entries.length).toBeGreaterThan(0);
    const first = entries[0]!;
    expect(first.name).toBe("note.txt");
    const decoded = Buffer.from(first.base64, "base64").toString("utf-8");
    expect(decoded).toBe("tar payload");
  });
});
