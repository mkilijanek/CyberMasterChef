import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { adler32Checksum } from "../src/ops/adler32.js";
import { analyseHash } from "../src/ops/analyseHash.js";
import { atbashCipher } from "../src/ops/atbashCipher.js";
import { affineCipherEncode } from "../src/ops/affineCipherEncode.js";
import { affineCipherDecode } from "../src/ops/affineCipherDecode.js";
import { a1z26CipherEncode } from "../src/ops/a1z26CipherEncode.js";
import { a1z26CipherDecode } from "../src/ops/a1z26CipherDecode.js";
import { baconCipherEncode } from "../src/ops/baconCipherEncode.js";
import { baconCipherDecode } from "../src/ops/baconCipherDecode.js";
import { bcryptParse } from "../src/ops/bcryptParse.js";

describe("crypto operations", () => {
  it("computes Adler-32 checksum", async () => {
    const registry = new InMemoryRegistry();
    registry.register(adler32Checksum);
    const recipe: Recipe = { version: 1, steps: [{ opId: "hash.adler32" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "Hello" }
    });
    expect(out.output).toEqual({ type: "string", value: "058c01f5" });
  });

  it("analyses hash candidates", async () => {
    const registry = new InMemoryRegistry();
    registry.register(analyseHash);
    const recipe: Recipe = { version: 1, steps: [{ opId: "hash.analyseHash" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "d41d8cd98f00b204e9800998ecf8427e" }
    });
    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    expect(out.output.value).toMatchObject({ isHex: true, candidates: ["md5"] });
  });

  it("applies Atbash cipher", async () => {
    const registry = new InMemoryRegistry();
    registry.register(atbashCipher);
    const recipe: Recipe = { version: 1, steps: [{ opId: "crypto.atbashCipher" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "Abc" }
    });
    expect(out.output).toEqual({ type: "string", value: "Zyx" });
  });

  it("encodes and decodes affine cipher", async () => {
    const registry = new InMemoryRegistry();
    registry.register(affineCipherEncode);
    registry.register(affineCipherDecode);
    const recipe: Recipe = {
      version: 1,
      steps: [
        { opId: "crypto.affineCipherEncode", args: { a: 5, b: 8 } },
        { opId: "crypto.affineCipherDecode", args: { a: 5, b: 8 } }
      ]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "abc" }
    });
    expect(out.output).toEqual({ type: "string", value: "abc" });
  });

  it("encodes and decodes A1Z26 cipher", async () => {
    const registry = new InMemoryRegistry();
    registry.register(a1z26CipherEncode);
    registry.register(a1z26CipherDecode);
    const recipe: Recipe = {
      version: 1,
      steps: [
        { opId: "crypto.a1z26CipherEncode" },
        { opId: "crypto.a1z26CipherDecode" }
      ]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "abc" }
    });
    expect(out.output).toEqual({ type: "string", value: "ABC" });
  });

  it("encodes and decodes Bacon cipher", async () => {
    const registry = new InMemoryRegistry();
    registry.register(baconCipherEncode);
    registry.register(baconCipherDecode);
    const recipe: Recipe = {
      version: 1,
      steps: [
        { opId: "crypto.baconCipherEncode" },
        { opId: "crypto.baconCipherDecode" }
      ]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "abc" }
    });
    expect(out.output).toEqual({ type: "string", value: "ABC" });
  });

  it("parses bcrypt hash", async () => {
    const registry = new InMemoryRegistry();
    registry.register(bcryptParse);
    const recipe: Recipe = { version: 1, steps: [{ opId: "crypto.bcryptParse" }] };
    const hash = `$2b$10$${"A".repeat(53)}`;
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: hash }
    });
    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    expect(out.output.value).toMatchObject({ isValid: true, version: "2b", cost: 10 });
  });
});
