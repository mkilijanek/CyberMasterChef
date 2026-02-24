import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe } from "@cybermasterchef/core";
import type { Recipe } from "@cybermasterchef/core";
import { standardPlugin } from "../src/index.js";

describe("standardPlugin", () => {
  it("registers expected built-in operations", () => {
    const registry = new InMemoryRegistry();
    standardPlugin.register(registry);

    expect(registry.list().map((op) => op.id).sort()).toEqual([
      "codec.fromBase64",
      "codec.fromBinary",
      "codec.fromHex",
      "codec.toBase64",
      "codec.toBinary",
      "codec.toHex",
      "codec.urlDecode",
      "codec.urlEncode",
      "hash.sha256",
      "text.lowercase",
      "text.reverse"
    ]);
  });

  it("runs a simple built-in recipe", async () => {
    const registry = new InMemoryRegistry();
    standardPlugin.register(registry);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "codec.toHex" }, { opId: "codec.fromHex" }]
    };

    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "hello" }
    });

    expect(out.output.type).toBe("bytes");
    if (out.output.type !== "bytes") return;
    expect(new TextDecoder().decode(out.output.value)).toBe("hello");
  });

  it("supports URL encode/decode and reverse", async () => {
    const registry = new InMemoryRegistry();
    standardPlugin.register(registry);
    const recipe: Recipe = {
      version: 1,
      steps: [
        { opId: "codec.urlEncode" },
        { opId: "codec.urlDecode" },
        { opId: "text.reverse" }
      ]
    };

    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "ab cd" }
    });

    expect(out.output).toEqual({ type: "string", value: "dc ba" });
  });
});
