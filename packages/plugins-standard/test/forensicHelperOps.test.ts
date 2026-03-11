import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { analyseUuid } from "../src/ops/analyseUuid.js";
import { entropy } from "../src/ops/entropy.js";
import { ctph } from "../src/ops/ctph.js";
import { generateUuid } from "../src/ops/generateUuid.js";
import { fileTree } from "../src/ops/fileTree.js";
import { yaraRules } from "../src/ops/yaraRules.js";
import { chiSquareOp } from "../src/ops/chiSquare.js";
import { detectFileType } from "../src/ops/detectFileType.js";
import { elfInfo } from "../src/ops/elfInfo.js";

describe("forensic helper operations", () => {
  it("analyses UUID version and variant", async () => {
    const registry = new InMemoryRegistry();
    registry.register(analyseUuid);
    const recipe: Recipe = { version: 1, steps: [{ opId: "forensic.analyseUuid" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "550e8400-e29b-41d4-a716-446655440000" }
    });
    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    expect(out.output.value).toMatchObject({ isValid: true, version: 4, variant: "RFC4122" });
  });

  it("computes chi-square statistic", async () => {
    const registry = new InMemoryRegistry();
    registry.register(chiSquareOp);
    const recipe: Recipe = { version: 1, steps: [{ opId: "forensic.chiSquare" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "AAAA" }
    });
    expect(out.output).toEqual({ type: "string", value: "1020.0000" });
  });

  it("computes entropy and segment reports", async () => {
    const registry = new InMemoryRegistry();
    registry.register(entropy);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "forensic.entropy", args: { segmentSize: 2 } }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: new Uint8Array([0, 1, 2, 3]) }
    });
    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    expect(out.output.value).toMatchObject({
      sizeBytes: 4,
      overallEntropy: 2,
      distinctByteCount: 4,
      segmentSize: 2
    });
    expect((out.output.value as { segments: Array<{ entropy: number }> }).segments).toEqual([
      { offset: 0, size: 2, entropy: 1 },
      { offset: 2, size: 2, entropy: 1 }
    ]);
  });

  it("computes deterministic CTPH digests", async () => {
    const registry = new InMemoryRegistry();
    registry.register(ctph);
    const recipe: Recipe = { version: 1, steps: [{ opId: "forensic.ctph" }] };
    const input = { type: "string", value: "This is a stable ssdeep fixture for CyberMasterChef." } as const;
    const run1 = await runRecipe({ registry, recipe, input });
    const run2 = await runRecipe({ registry, recipe, input });
    expect(run1.output.type).toBe("string");
    expect(run2.output.type).toBe("string");
    if (run1.output.type !== "string" || run2.output.type !== "string") return;
    expect(run1.output.value).toBe(run2.output.value);
    expect(run1.output.value).toContain(":");
  });

  it("generates nil, random v4, and deterministic v5 UUIDs", async () => {
    const registry = new InMemoryRegistry();
    registry.register(generateUuid);

    const nilOut = await runRecipe({
      registry,
      recipe: {
        version: 1,
        steps: [{ opId: "forensic.generateUuid", args: { version: "nil" } }]
      },
      input: { type: "string", value: "" }
    });
    expect(nilOut.output).toEqual({
      type: "string",
      value: "00000000-0000-0000-0000-000000000000"
    });

    const v5Recipe: Recipe = {
      version: 1,
      steps: [
        {
          opId: "forensic.generateUuid",
          args: {
            version: "v5",
            namespace: "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
          }
        }
      ]
    };
    const v5Run1 = await runRecipe({
      registry,
      recipe: v5Recipe,
      input: { type: "string", value: "cybermasterchef" }
    });
    const v5Run2 = await runRecipe({
      registry,
      recipe: v5Recipe,
      input: { type: "string", value: "cybermasterchef" }
    });
    expect(v5Run1.output).toEqual(v5Run2.output);

    const v4Out = await runRecipe({
      registry,
      recipe: {
        version: 1,
        steps: [{ opId: "forensic.generateUuid", args: { version: "v4" } }]
      },
      input: { type: "string", value: "" }
    });
    expect(v4Out.output.type).toBe("string");
    if (v4Out.output.type !== "string") return;
    expect(v4Out.output.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it("builds a deterministic file tree from archive-like JSON input", async () => {
    const registry = new InMemoryRegistry();
    registry.register(fileTree);
    const recipe: Recipe = { version: 1, steps: [{ opId: "forensic.fileTree" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: {
        type: "json",
        value: {
          entries: [
            { name: "logs/app.log" },
            { name: "logs/2026/march.txt" },
            { normalizedPath: "config\\\\prod\\\\app.yml" },
            { path: "logs/app.log" }
          ]
        }
      }
    });
    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    expect(out.output.value).toMatchObject({
      pathCount: 3,
      paths: ["config/prod/app.yml", "logs/2026/march.txt", "logs/app.log"]
    });
    expect((out.output.value as { tree: Array<{ name: string }> }).tree[0]?.name).toBe("config");
  });

  it("generates deterministic YARA rules from printable input", async () => {
    const registry = new InMemoryRegistry();
    registry.register(yaraRules);
    const recipe: Recipe = {
      version: 1,
      steps: [
        {
          opId: "forensic.yaraRules",
          args: { ruleName: "cyber masterchef", maxStrings: 2, minStringLength: 5 }
        }
      ]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "https://evil.example powershell -enc AAAA" }
    });
    expect(out.output.type).toBe("string");
    if (out.output.type !== "string") return;
    expect(out.output.value).toContain("rule cyber_masterchef {");
    expect(out.output.value).toContain('generator = "CyberMasterChef"');
    expect(out.output.value).toContain("$s1");
    expect(out.output.value).toContain("all of them");
  });

  it("falls back to filesize condition when no printable strings exist", async () => {
    const registry = new InMemoryRegistry();
    registry.register(yaraRules);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "forensic.yaraRules", args: { minStringLength: 4 } }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: new Uint8Array([0, 1, 2, 3]) }
    });
    expect(out.output.type).toBe("string");
    if (out.output.type !== "string") return;
    expect(out.output.value).toContain("filesize >= 0");
  });

  it("detects file type from magic bytes", async () => {
    const registry = new InMemoryRegistry();
    registry.register(detectFileType);
    const recipe: Recipe = { version: 1, steps: [{ opId: "forensic.detectFileType" }] };
    const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: pngHeader }
    });
    expect(out.output).toEqual({ type: "string", value: "png" });
  });

  it("extracts basic ELF metadata", async () => {
    const registry = new InMemoryRegistry();
    registry.register(elfInfo);
    const recipe: Recipe = { version: 1, steps: [{ opId: "forensic.elfInfo" }] };
    const header = new Uint8Array(52);
    header[0] = 0x7f; header[1] = 0x45; header[2] = 0x4c; header[3] = 0x46; // ELF
    header[4] = 1; // 32-bit
    header[5] = 1; // little endian
    header[6] = 1; // version
    header[7] = 0; // SYSV
    header[8] = 0; // ABI version
    header[16] = 2; header[17] = 0; // type = ET_EXEC
    header[18] = 3; header[19] = 0; // machine = EM_386
    header[24] = 0x00; header[25] = 0x80; header[26] = 0x04; header[27] = 0x08; // entry 0x08048000
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: header }
    });
    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    expect(out.output.value).toMatchObject({ isElf: true, class: "ELF32", endianness: "little" });
  });
});
