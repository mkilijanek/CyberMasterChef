import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { analyseUuid } from "../src/ops/analyseUuid.js";
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
