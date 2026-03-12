import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { toBase32 } from "../src/ops/toBase32.js";
import { fromBase32 } from "../src/ops/fromBase32.js";
import { toBase45 } from "../src/ops/toBase45.js";
import { fromBase45 } from "../src/ops/fromBase45.js";
import { toBase58 } from "../src/ops/toBase58.js";
import { fromBase58 } from "../src/ops/fromBase58.js";
import { toBase62 } from "../src/ops/toBase62.js";
import { fromBase62 } from "../src/ops/fromBase62.js";
import { toBase85 } from "../src/ops/toBase85.js";
import { fromBase85 } from "../src/ops/fromBase85.js";
import { toBase92 } from "../src/ops/toBase92.js";
import { fromBase92 } from "../src/ops/fromBase92.js";
import { toBech32 } from "../src/ops/toBech32.js";
import { fromBech32 } from "../src/ops/fromBech32.js";
import { toBraille } from "../src/ops/toBraille.js";
import { fromBraille } from "../src/ops/fromBraille.js";
import { toPunycode } from "../src/ops/toPunycode.js";
import { fromPunycode } from "../src/ops/fromPunycode.js";
import { toModhex } from "../src/ops/toModhex.js";
import { fromModhex } from "../src/ops/fromModhex.js";
import { toMorseCode } from "../src/ops/toMorseCode.js";
import { fromMorseCode } from "../src/ops/fromMorseCode.js";
import { rot13BruteForce } from "../src/ops/rot13BruteForce.js";
import { rot47 } from "../src/ops/rot47.js";
import { rot47BruteForce } from "../src/ops/rot47BruteForce.js";
import { toCharcode } from "../src/ops/toCharcode.js";
import { fromCharcode } from "../src/ops/fromCharcode.js";
import { toDecimal } from "../src/ops/toDecimal.js";
import { fromDecimal } from "../src/ops/fromDecimal.js";
import { toOctal } from "../src/ops/toOctal.js";
import { fromOctal } from "../src/ops/fromOctal.js";
import { toHexContent } from "../src/ops/toHexContent.js";
import { fromHexContent } from "../src/ops/fromHexContent.js";
import { fromBinary } from "../src/ops/fromBinary.js";
import { dropBytes } from "../src/ops/dropBytes.js";
import { takeBytes } from "../src/ops/takeBytes.js";
import { dropNthBytes } from "../src/ops/dropNthBytes.js";
import { takeNthBytes } from "../src/ops/takeNthBytes.js";
import { removeNullBytes } from "../src/ops/removeNullBytes.js";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function run(registry: InMemoryRegistry, recipe: Recipe, value: string | Uint8Array) {
  return runRecipe({
    registry,
    recipe,
    input: typeof value === "string" ? { type: "string", value } : { type: "bytes", value }
  });
}

describe("encoding operations", () => {
  it("round-trips Base32 encoding", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toBase32);
    registry.register(fromBase32);
    const out = await run(registry, {
      version: 1,
      steps: [{ opId: "codec.toBase32" }, { opId: "codec.fromBase32" }]
    }, "hello");
    expect(out.output).toEqual({ type: "bytes", value: encoder.encode("hello") });
  });

  it("round-trips Base45 encoding", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toBase45);
    registry.register(fromBase45);
    const out = await run(registry, {
      version: 1,
      steps: [{ opId: "codec.toBase45" }, { opId: "codec.fromBase45" }]
    }, "hello");
    expect(out.output).toEqual({ type: "bytes", value: encoder.encode("hello") });
  });

  it("round-trips Base58 encoding", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toBase58);
    registry.register(fromBase58);
    const out = await run(registry, {
      version: 1,
      steps: [{ opId: "codec.toBase58" }, { opId: "codec.fromBase58" }]
    }, "hello");
    expect(out.output).toEqual({ type: "bytes", value: encoder.encode("hello") });
  });

  it("round-trips Base62 encoding", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toBase62);
    registry.register(fromBase62);
    const out = await run(registry, {
      version: 1,
      steps: [{ opId: "codec.toBase62" }, { opId: "codec.fromBase62" }]
    }, "hello");
    expect(out.output).toEqual({ type: "bytes", value: encoder.encode("hello") });
  });

  it("round-trips Base85 encoding", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toBase85);
    registry.register(fromBase85);
    const out = await run(registry, {
      version: 1,
      steps: [{ opId: "codec.toBase85" }, { opId: "codec.fromBase85" }]
    }, "hello");
    expect(out.output).toEqual({ type: "bytes", value: encoder.encode("hello") });
  });

  it("round-trips Base92 encoding", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toBase92);
    registry.register(fromBase92);
    const out = await run(registry, {
      version: 1,
      steps: [{ opId: "codec.toBase92" }, { opId: "codec.fromBase92" }]
    }, "hello");
    expect(out.output).toEqual({ type: "bytes", value: encoder.encode("hello") });
  });

  it("round-trips Bech32 encoding", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toBech32);
    registry.register(fromBech32);
    const out = await run(registry, {
      version: 1,
      steps: [
        { opId: "codec.toBech32", args: { hrp: "cmc" } },
        { opId: "codec.fromBech32" }
      ]
    }, "hello");
    expect(out.output).toEqual({ type: "bytes", value: encoder.encode("hello") });
  });

  it("round-trips Braille text", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toBraille);
    registry.register(fromBraille);
    const out = await run(registry, {
      version: 1,
      steps: [{ opId: "codec.toBraille" }, { opId: "codec.fromBraille" }]
    }, "HELLO 123!");
    expect(out.output).toEqual({ type: "string", value: "HELLO 123!" });
  });

  it("round-trips Punycode text", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toPunycode);
    registry.register(fromPunycode);
    const out = await run(registry, {
      version: 1,
      steps: [{ opId: "codec.toPunycode" }, { opId: "codec.fromPunycode" }]
    }, "münchen");
    expect(out.output).toEqual({ type: "string", value: "münchen" });
  });

  it("round-trips Punycode in IDN mode", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toPunycode);
    registry.register(fromPunycode);
    const out = await run(registry, {
      version: 1,
      steps: [
        { opId: "codec.toPunycode", args: { idn: true } },
        { opId: "codec.fromPunycode", args: { idn: true } }
      ]
    }, "münchen.example");
    expect(out.output).toEqual({ type: "string", value: "münchen.example" });
  });

  it("round-trips Modhex", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toModhex);
    registry.register(fromModhex);
    const out = await run(registry, {
      version: 1,
      steps: [{ opId: "codec.toModhex" }, { opId: "codec.fromModhex" }]
    }, "hello");
    expect(out.output).toEqual({ type: "bytes", value: encoder.encode("hello") });
  });

  it("round-trips Morse code with defaults and custom delimiters", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toMorseCode);
    registry.register(fromMorseCode);

    const normal = await run(registry, {
      version: 1,
      steps: [{ opId: "codec.toMorseCode" }, { opId: "codec.fromMorseCode" }]
    }, "SOS TEST");
    expect(normal.output).toEqual({ type: "string", value: "SOS TEST" });

    const custom = await run(registry, {
      version: 1,
      steps: [
        { opId: "codec.toMorseCode", args: { letterDelimiter: "|", wordDelimiter: " || " } },
        { opId: "codec.fromMorseCode", args: { letterDelimiter: "|", wordDelimiter: " || " } }
      ]
    }, "SOS TEST");
    expect(custom.output).toEqual({ type: "string", value: "SOS TEST" });
  });

  it("encodes and decodes charcodes with default and custom delimiters", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toCharcode);
    registry.register(fromCharcode);

    const encoded = await run(registry, {
      version: 1,
      steps: [{ opId: "codec.toCharcode" }]
    }, "ABC");
    expect(encoded.output).toEqual({ type: "string", value: "65 66 67" });

    const decoded = await run(registry, {
      version: 1,
      steps: [{ opId: "codec.fromCharcode", args: { delimiter: "|" } }]
    }, "65|66|67");
    expect(decoded.output).toEqual({ type: "bytes", value: new Uint8Array([65, 66, 67]) });
  });

  it("encodes and decodes decimals with default and custom delimiters", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toDecimal);
    registry.register(fromDecimal);

    const encoded = await run(registry, {
      version: 1,
      steps: [{ opId: "codec.toDecimal" }]
    }, "ABC");
    expect(encoded.output).toEqual({ type: "string", value: "65 66 67" });

    const decoded = await run(registry, {
      version: 1,
      steps: [{ opId: "codec.fromDecimal", args: { delimiter: "|" } }]
    }, "65|66|67");
    expect(decoded.output).toEqual({ type: "bytes", value: new Uint8Array([65, 66, 67]) });
  });

  it("encodes and decodes octal with default and custom delimiters", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toOctal);
    registry.register(fromOctal);

    const encoded = await run(registry, {
      version: 1,
      steps: [{ opId: "codec.toOctal", args: { delimiter: "|" } }]
    }, "ABC");
    expect(encoded.output).toEqual({ type: "string", value: "101|102|103" });

    const decoded = await run(registry, {
      version: 1,
      steps: [{ opId: "codec.fromOctal", args: { delimiter: "|" } }]
    }, "101|102|103");
    expect(decoded.output).toEqual({ type: "bytes", value: new Uint8Array([65, 66, 67]) });
  });

  it("encodes and decodes hex content", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toHexContent);
    registry.register(fromHexContent);

    const encoded = await run(registry, {
      version: 1,
      steps: [{ opId: "codec.toHexContent" }]
    }, "Hi");
    expect(encoded.output).toEqual({ type: "string", value: "4869" });

    const decoded = await run(registry, {
      version: 1,
      steps: [{ opId: "codec.fromHexContent" }]
    }, "48 69");
    expect(decoded.output).toEqual({ type: "bytes", value: encoder.encode("Hi") });
  });

  it("generates all ROT13 candidates", async () => {
    const registry = new InMemoryRegistry();
    registry.register(rot13BruteForce);

    const out = await run(registry, {
      version: 1,
      steps: [{ opId: "text.rot13BruteForce" }]
    }, "Uryyb");

    expect(out.output.type).toBe("string");
    if (out.output.type !== "string") return;
    const lines = out.output.value.split("\n");
    expect(lines).toHaveLength(26);
    expect(lines[0]).toBe("0: Uryyb");
    expect(lines[13]).toBe("13: Hello");
    expect(lines[25]).toBe("25: Tqxxa");
  });

  it("applies ROT47 and brute-forces printable ASCII shifts", async () => {
    const registry = new InMemoryRegistry();
    registry.register(rot47);
    registry.register(rot47BruteForce);

    const encoded = await run(registry, {
      version: 1,
      steps: [{ opId: "text.rot47" }]
    }, "Hello!");
    expect(encoded.output).toEqual({ type: "string", value: "w6==@P" });

    const decoded = await run(registry, {
      version: 1,
      steps: [{ opId: "text.rot47" }]
    }, "w6==@P");
    expect(decoded.output).toEqual({ type: "string", value: "Hello!" });

    const bruteForce = await run(registry, {
      version: 1,
      steps: [{ opId: "text.rot47BruteForce" }]
    }, "w6==@P");
    expect(bruteForce.output.type).toBe("string");
    if (bruteForce.output.type !== "string") return;
    const lines = bruteForce.output.value.split("\n");
    expect(lines).toHaveLength(94);
    expect(lines[0]).toBe("0: w6==@P");
    expect(lines[47]).toBe("47: Hello!");
    expect(lines[93]).toBe("93: v5<<?O");
  });

  it("rejects non-string input for ROT operations", () => {
    expect(() =>
      rot13BruteForce.run({ input: { type: "bytes", value: encoder.encode("abc") } } as never)
    ).toThrow("Expected string input");

    expect(() =>
      rot47.run({ input: { type: "bytes", value: encoder.encode("abc") } } as never)
    ).toThrow("Expected string input");

    expect(() =>
      rot47BruteForce.run({ input: { type: "bytes", value: encoder.encode("abc") } } as never)
    ).toThrow("Expected string input");
  });

  it("drops and takes byte ranges", async () => {
    const registry = new InMemoryRegistry();
    registry.register(dropBytes);
    registry.register(takeBytes);

    const dropped = await run(registry, {
      version: 1,
      steps: [{ opId: "bytes.dropBytes", args: { start: 1, length: 2 } }]
    }, new Uint8Array([1, 2, 3, 4, 5]));
    expect(dropped.output).toEqual({ type: "bytes", value: new Uint8Array([1, 4, 5]) });

    const taken = await run(registry, {
      version: 1,
      steps: [{ opId: "bytes.takeBytes", args: { start: -2, length: 2 } }]
    }, new Uint8Array([1, 2, 3, 4, 5]));
    expect(taken.output).toEqual({ type: "bytes", value: new Uint8Array([4, 5]) });
  });

  it("applies byte range transforms per line", async () => {
    const registry = new InMemoryRegistry();
    registry.register(dropBytes);
    registry.register(takeBytes);

    const dropped = await run(registry, {
      version: 1,
      steps: [{ opId: "bytes.dropBytes", args: { start: 1, length: 1, applyToEachLine: true } }]
    }, "abc\ndef");
    expect(decoder.decode(dropped.output.type === "bytes" ? dropped.output.value : new Uint8Array()))
      .toBe("ac\ndf");

    const taken = await run(registry, {
      version: 1,
      steps: [{ opId: "bytes.takeBytes", args: { start: 1, length: 1, applyToEachLine: true } }]
    }, "abc\ndef");
    expect(decoder.decode(taken.output.type === "bytes" ? taken.output.value : new Uint8Array()))
      .toBe("b\ne");
  });

  it("drops and takes nth bytes", async () => {
    const registry = new InMemoryRegistry();
    registry.register(dropNthBytes);
    registry.register(takeNthBytes);

    const dropped = await run(registry, {
      version: 1,
      steps: [{ opId: "bytes.dropNthBytes", args: { every: 2, startingAt: 1 } }]
    }, new Uint8Array([1, 2, 3, 4, 5]));
    expect(dropped.output).toEqual({ type: "bytes", value: new Uint8Array([1, 3, 5]) });

    const taken = await run(registry, {
      version: 1,
      steps: [{ opId: "bytes.takeNthBytes", args: { every: 2, startingAt: 1 } }]
    }, new Uint8Array([1, 2, 3, 4, 5]));
    expect(taken.output).toEqual({ type: "bytes", value: new Uint8Array([2, 4]) });
  });

  it("applies nth-byte transforms per line", async () => {
    const registry = new InMemoryRegistry();
    registry.register(dropNthBytes);
    registry.register(takeNthBytes);

    const dropped = await run(registry, {
      version: 1,
      steps: [
        { opId: "bytes.dropNthBytes", args: { every: 2, startingAt: 0, applyToEachLine: true } }
      ]
    }, "abcd\nefgh");
    expect(decoder.decode(dropped.output.type === "bytes" ? dropped.output.value : new Uint8Array()))
      .toBe("bd\nfh");

    const taken = await run(registry, {
      version: 1,
      steps: [
        { opId: "bytes.takeNthBytes", args: { every: 2, startingAt: 0, applyToEachLine: true } }
      ]
    }, "abcd\nefgh");
    expect(decoder.decode(taken.output.type === "bytes" ? taken.output.value : new Uint8Array()))
      .toBe("ac\neg");
  });

  it("removes null bytes", async () => {
    const registry = new InMemoryRegistry();
    registry.register(removeNullBytes);
    const out = await run(registry, {
      version: 1,
      steps: [{ opId: "bytes.removeNullBytes" }]
    }, new Uint8Array([0, 65, 0, 66, 0]));
    expect(out.output).toEqual({ type: "bytes", value: new Uint8Array([65, 66]) });
  });

  it("covers error branches for delimiter and content transforms", () => {
    expect(() =>
      fromBinary.run({
        input: { type: "string", value: "01000001|oops" },
        args: { delimiter: "|" }
      })
    ).toThrow("Invalid binary octet");

    expect(() =>
      fromCharcode.run({
        input: { type: "string", value: "65|999" },
        args: { delimiter: "|" }
      })
    ).toThrow("Charcode out of range");

    expect(() =>
      fromDecimal.run({
        input: { type: "string", value: "65|999" },
        args: { delimiter: "|" }
      })
    ).toThrow("Decimal byte out of range");

    expect(() =>
      fromOctal.run({
        input: { type: "string", value: "101|999" },
        args: { delimiter: "|" }
      })
    ).toThrow("Invalid octal token");

    expect(() =>
      fromMorseCode.run({
        input: { type: "string", value: "...|---|???" },
        args: { letterDelimiter: "|", wordDelimiter: " || " }
      })
    ).toThrow("Invalid Morse token");

    expect(() =>
      dropNthBytes.run({
        input: { type: "bytes", value: new Uint8Array([1, 2]) },
        args: { every: 0, startingAt: 0, applyToEachLine: false }
      })
    ).toThrow("positive integer");

    expect(() =>
      takeNthBytes.run({
        input: { type: "bytes", value: new Uint8Array([1, 2]) },
        args: { every: 2, startingAt: -1, applyToEachLine: false }
      })
    ).toThrow("positive or zero integer");

    expect(() =>
      fromModhex.run({
        input: { type: "string", value: "abc" },
        args: {}
      })
    ).toThrow("even number of characters");

    expect(() =>
      toBase92.run({
        input: { type: "json", value: {} } as never,
        args: {}
      })
    ).toThrow("Expected bytes or string input");

    expect(() =>
      toBraille.run({
        input: { type: "bytes", value: new Uint8Array() } as never,
        args: {}
      })
    ).toThrow("Expected string input");
  });
});
