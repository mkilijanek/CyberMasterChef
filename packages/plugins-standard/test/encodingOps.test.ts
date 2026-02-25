import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { toBase58 } from "../src/ops/toBase58.js";
import { fromBase58 } from "../src/ops/fromBase58.js";
import { toCharcode } from "../src/ops/toCharcode.js";
import { fromCharcode } from "../src/ops/fromCharcode.js";
import { toDecimal } from "../src/ops/toDecimal.js";
import { fromDecimal } from "../src/ops/fromDecimal.js";
import { toOctal } from "../src/ops/toOctal.js";
import { fromOctal } from "../src/ops/fromOctal.js";
import { toHexContent } from "../src/ops/toHexContent.js";
import { fromHexContent } from "../src/ops/fromHexContent.js";

describe("encoding operations", () => {
  it("round-trips Base58 encoding", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toBase58);
    registry.register(fromBase58);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "codec.toBase58" }, { opId: "codec.fromBase58" }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "hello" }
    });
    expect(out.output.type).toBe("bytes");
    if (out.output.type !== "bytes") return;
    expect(out.output.value).toEqual(new TextEncoder().encode("hello"));
  });

  it("encodes to charcodes", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toCharcode);
    const recipe: Recipe = { version: 1, steps: [{ opId: "codec.toCharcode" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "ABC" }
    });
    expect(out.output).toEqual({ type: "string", value: "65 66 67" });
  });

  it("decodes from charcodes", async () => {
    const registry = new InMemoryRegistry();
    registry.register(fromCharcode);
    const recipe: Recipe = { version: 1, steps: [{ opId: "codec.fromCharcode" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "65 66 67" }
    });
    expect(out.output.type).toBe("bytes");
    if (out.output.type !== "bytes") return;
    expect(out.output.value).toEqual(new Uint8Array([65, 66, 67]));
  });

  it("encodes to decimals", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toDecimal);
    const recipe: Recipe = { version: 1, steps: [{ opId: "codec.toDecimal" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "ABC" }
    });
    expect(out.output).toEqual({ type: "string", value: "65 66 67" });
  });

  it("decodes from decimals", async () => {
    const registry = new InMemoryRegistry();
    registry.register(fromDecimal);
    const recipe: Recipe = { version: 1, steps: [{ opId: "codec.fromDecimal" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "65 66 67" }
    });
    expect(out.output.type).toBe("bytes");
    if (out.output.type !== "bytes") return;
    expect(out.output.value).toEqual(new Uint8Array([65, 66, 67]));
  });

  it("encodes to octal", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toOctal);
    const recipe: Recipe = { version: 1, steps: [{ opId: "codec.toOctal" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "ABC" }
    });
    expect(out.output).toEqual({ type: "string", value: "101 102 103" });
  });

  it("decodes from octal", async () => {
    const registry = new InMemoryRegistry();
    registry.register(fromOctal);
    const recipe: Recipe = { version: 1, steps: [{ opId: "codec.fromOctal" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "101 102 103" }
    });
    expect(out.output.type).toBe("bytes");
    if (out.output.type !== "bytes") return;
    expect(out.output.value).toEqual(new Uint8Array([65, 66, 67]));
  });

  it("encodes to hex content", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toHexContent);
    const recipe: Recipe = { version: 1, steps: [{ opId: "codec.toHexContent" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "Hi" }
    });
    expect(out.output).toEqual({ type: "string", value: "4869" });
  });

  it("decodes from hex content", async () => {
    const registry = new InMemoryRegistry();
    registry.register(fromHexContent);
    const recipe: Recipe = { version: 1, steps: [{ opId: "codec.fromHexContent" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "48 69" }
    });
    expect(out.output.type).toBe("bytes");
    if (out.output.type !== "bytes") return;
    expect(new TextDecoder().decode(out.output.value)).toBe("Hi");
  });
});
