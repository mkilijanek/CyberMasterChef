import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe } from "@cybermasterchef/core";
import type { Recipe } from "@cybermasterchef/core";
import { bitShiftLeft } from "../src/ops/bitShiftLeft.js";
import { bitShiftRight } from "../src/ops/bitShiftRight.js";
import { expandAlphabetRange } from "../src/ops/expandAlphabetRange.js";
import { escapeString } from "../src/ops/escapeString.js";
import {
  byteWidth,
  decodeFloats,
  encodeFloats,
  normalizeEndianness,
  normalizeFloatWidth,
  parseByteInput
} from "../src/ops/floatCodecUtils.js";
import { fromFloat } from "../src/ops/fromFloat.js";
import { toFloat } from "../src/ops/toFloat.js";

describe("misc utility parity wave 2", () => {
  it("shifts bytes left and right", async () => {
    const registry = new InMemoryRegistry();
    registry.register(bitShiftLeft);
    registry.register(bitShiftRight);

    const leftRecipe: Recipe = {
      version: 1,
      steps: [{ opId: "bytes.bitShiftLeft", args: { amount: 2 } }]
    };
    const rightRecipe: Recipe = {
      version: 1,
      steps: [{ opId: "bytes.bitShiftRight", args: { amount: 1 } }]
    };

    const shiftedLeft = await runRecipe({
      registry,
      recipe: leftRecipe,
      input: { type: "bytes", value: new Uint8Array([1, 15, 255]) }
    });
    expect(shiftedLeft.output).toEqual({ type: "bytes", value: new Uint8Array([4, 60, 252]) });

    const shiftedRight = await runRecipe({
      registry,
      recipe: rightRecipe,
      input: { type: "string", value: "AB" }
    });
    expect(shiftedRight.output.type).toBe("bytes");
    if (shiftedRight.output.type !== "bytes") return;
    expect([...shiftedRight.output.value]).toEqual([32, 33]);
  });

  it("expands alphabet ranges and escapes strings", async () => {
    const registry = new InMemoryRegistry();
    registry.register(expandAlphabetRange);
    registry.register(escapeString);

    const expanded = await runRecipe({
      registry,
      recipe: {
        version: 1,
        steps: [{ opId: "text.expandAlphabetRange", args: { delimiter: "|" } }]
      },
      input: { type: "string", value: "a-d Z-X 3-1 a-9" }
    });
    expect(expanded.output).toEqual({
      type: "string",
      value: "a|b|c|d Z|Y|X 3|2|1 a-9"
    });

    const escaped = await runRecipe({
      registry,
      recipe: {
        version: 1,
        steps: [{ opId: "text.escapeString", args: { escapeLevel: 2 } }]
      },
      input: { type: "string", value: "line\n\"quote'\"" }
    });
    expect(escaped.output).toEqual({
      type: "string",
      value: "line\\\\n\\\\\\\"quote\\\\\\'\\\\\\\""
    });
  });

  it("encodes and decodes floats in both widths", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toFloat);
    registry.register(fromFloat);

    const float32Bytes = await runRecipe({
      registry,
      recipe: {
        version: 1,
        steps: [
          { opId: "codec.toFloat", args: { width: "float32", endianness: "little", delimiter: "," } }
        ]
      },
      input: { type: "string", value: "1.5,-2.25" }
    });
    expect(float32Bytes.output.type).toBe("bytes");
    if (float32Bytes.output.type !== "bytes") return;
    expect([...float32Bytes.output.value]).toEqual([0, 0, 192, 63, 0, 0, 16, 192]);

    const decoded32 = await runRecipe({
      registry,
      recipe: {
        version: 1,
        steps: [
          { opId: "codec.fromFloat", args: { width: "float32", endianness: "little", delimiter: "," } }
        ]
      },
      input: { type: "string", value: "0,0,192,63,0,0,16,192" }
    });
    expect(decoded32.output).toEqual({ type: "string", value: "1.5,-2.25" });

    const float64RoundTrip = await runRecipe({
      registry,
      recipe: {
        version: 1,
        steps: [
          { opId: "codec.toFloat", args: { width: "float64", endianness: "big" } },
          { opId: "codec.fromFloat", args: { width: "float64", endianness: "big" } }
        ]
      },
      input: { type: "string", value: "3.25 -0.5" }
    });
    expect(float64RoundTrip.output).toEqual({ type: "string", value: "3.25 -0.5" });
  });

  it("covers helper branches and validation errors", () => {
    expect(normalizeFloatWidth("float64")).toBe("float64");
    expect(normalizeFloatWidth("nope")).toBe("float32");
    expect(normalizeEndianness("little")).toBe("little");
    expect(normalizeEndianness("big")).toBe("big");
    expect(byteWidth("float32")).toBe(4);
    expect(byteWidth("float64")).toBe(8);
    expect(parseByteInput("", ",")).toEqual(new Uint8Array());
    expect(parseByteInput("0|255", "|")).toEqual(new Uint8Array([0, 255]));
    expect(() => parseByteInput("256", ",")).toThrow("Byte value out of range: 256");

    const encoded = encodeFloats([1.25], "float32", "big");
    expect([...encoded]).toEqual([63, 160, 0, 0]);
    expect(decodeFloats(encoded, "float32", "big")).toEqual([1.25]);
    expect(decodeFloats(encodeFloats([2.5], "float64", "little"), "float64", "little")).toEqual([2.5]);
    expect(() => decodeFloats(new Uint8Array([1, 2, 3]), "float32", "big")).toThrow(
      "Input length must be a multiple of 4 bytes"
    );

    expect(
      bitShiftLeft.run({ input: { type: "string", value: "A" }, args: { amount: 0 } })
    ).toEqual({ type: "bytes", value: new TextEncoder().encode("A") });
    expect(
      bitShiftLeft.run({ input: { type: "bytes", value: new Uint8Array([2]) }, args: {} })
    ).toEqual({ type: "bytes", value: new Uint8Array([4]) });
    expect(() =>
      bitShiftLeft.run({ input: { type: "number", value: 1 } as never, args: {} })
    ).toThrow("Expected bytes or string input");
    expect(() =>
      bitShiftLeft.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: { amount: 8 } })
    ).toThrow("Shift amount must be between 0 and 7");
    expect(
      bitShiftRight.run({ input: { type: "bytes", value: new Uint8Array([4]) }, args: {} })
    ).toEqual({ type: "bytes", value: new Uint8Array([2]) });
    expect(() =>
      bitShiftRight.run({ input: { type: "bytes", value: new Uint8Array([1]) }, args: { amount: -1 } })
    ).toThrow("Shift amount must be between 0 and 7");
    expect(() =>
      bitShiftRight.run({ input: { type: "number", value: 1 } as never, args: {} })
    ).toThrow("Expected bytes or string input");
    expect(
      expandAlphabetRange.run({
        input: { type: "string", value: "A-C" },
        args: { delimiter: 1 as never }
      })
    ).toEqual({ type: "string", value: "ABC" });
    expect(() =>
      expandAlphabetRange.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })
    ).toThrow("Expected string input");
    expect(() =>
      escapeString.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })
    ).toThrow("Expected string input");
    expect(() =>
      escapeString.run({ input: { type: "string", value: "x" }, args: { escapeLevel: 11 } })
    ).toThrow("Escape level must be between 0 and 10");
    expect(
      escapeString.run({ input: { type: "string", value: "plain" }, args: { escapeLevel: 0 } })
    ).toEqual({ type: "string", value: "plain" });
    expect(escapeString.run({ input: { type: "string", value: "x\ny" }, args: {} })).toEqual({
      type: "string",
      value: "x\\ny"
    });
    expect(() =>
      toFloat.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })
    ).toThrow("Expected string input");
    expect(
      toFloat.run({ input: { type: "string", value: "" }, args: {} })
    ).toEqual({ type: "bytes", value: new Uint8Array() });
    expect(() =>
      fromFloat.run({ input: { type: "number", value: 1 } as never, args: {} })
    ).toThrow("Expected bytes or string input");
    expect(
      fromFloat.run({ input: { type: "bytes", value: new Uint8Array() }, args: {} })
    ).toEqual({ type: "string", value: "" });
    const bigEndian = fromFloat.run({
      input: { type: "bytes", value: new Uint8Array([63, 128, 0, 0]) },
      args: { width: "float32", endianness: "big", delimiter: "|" }
    });
    expect(bigEndian).toEqual({ type: "string", value: "1" });
  });
});
