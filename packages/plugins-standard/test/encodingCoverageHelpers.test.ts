import { describe, expect, it } from "vitest";
import { base92Chr, base92Ord, decodeBase92, encodeBase92 } from "../src/ops/base92Utils.js";
import { decodeBraille, encodeBraille } from "../src/ops/brailleUtils.js";
import {
  dropByteRange,
  dropNth,
  joinLines,
  splitLines,
  takeByteRange,
  takeNth,
  toBytes
} from "../src/ops/byteTransformUtils.js";
import { decodeModhex, encodeModhex } from "../src/ops/modhexUtils.js";
import { fromBase92 } from "../src/ops/fromBase92.js";
import { fromBraille } from "../src/ops/fromBraille.js";
import { fromBinary } from "../src/ops/fromBinary.js";
import { fromCharcode } from "../src/ops/fromCharcode.js";
import { fromDecimal } from "../src/ops/fromDecimal.js";
import { fromModhex } from "../src/ops/fromModhex.js";
import { fromOctal } from "../src/ops/fromOctal.js";
import { fromPunycode } from "../src/ops/fromPunycode.js";
import { toBase92 } from "../src/ops/toBase92.js";
import { toBraille } from "../src/ops/toBraille.js";
import { fromMorseCode } from "../src/ops/fromMorseCode.js";
import { toMorseCode } from "../src/ops/toMorseCode.js";
import { toModhex } from "../src/ops/toModhex.js";
import { toOctal } from "../src/ops/toOctal.js";
import { toPunycode } from "../src/ops/toPunycode.js";
import { dropBytes } from "../src/ops/dropBytes.js";
import { dropNthBytes } from "../src/ops/dropNthBytes.js";
import { takeBytes } from "../src/ops/takeBytes.js";
import { takeNthBytes } from "../src/ops/takeNthBytes.js";

describe("encoding helper coverage", () => {
  it("covers Base92 helper edge cases", () => {
    expect(base92Chr(0)).toBe("!");
    expect(base92Chr(62)).toBe("a");
    expect(() => base92Chr(-1)).toThrow("Invalid Base92 value");
    expect(base92Ord("!")).toBe(0);
    expect(base92Ord("#")).toBe(1);
    expect(base92Ord("a")).toBe(62);
    expect(() => base92Ord("~")).toThrow("Invalid Base92 character");
    expect(encodeBase92(new Uint8Array([255]))).not.toBe("");
    expect(encodeBase92(new Uint8Array([65]))).toHaveLength(2);
    expect(encodeBase92(new Uint8Array([65, 66]))).toHaveLength(3);
    expect(decodeBase92("!")).toEqual(new Uint8Array());
    expect(decodeBase92(encodeBase92(new Uint8Array([65])))).toEqual(new Uint8Array([65]));
    expect(decodeBase92(" ")).toEqual(new Uint8Array());
  });

  it("covers Braille passthrough cases", () => {
    expect(encodeBraille("~")).toBe("~");
    expect(decodeBraille("~")).toBe("~");
  });

  it("covers byte transform helper branches", () => {
    expect(toBytes({ type: "bytes", value: new Uint8Array([1, 2]) })).toEqual(new Uint8Array([1, 2]));
    expect(toBytes({ type: "string", value: "A" })).toEqual(new TextEncoder().encode("A"));
    expect(() => toBytes({ type: "json", value: {} } as never)).toThrow("Expected bytes or string input");

    expect(splitLines(new Uint8Array([65, 66]))).toEqual([new Uint8Array([65, 66])]);
    expect(joinLines([])).toEqual(new Uint8Array());

    expect(dropByteRange(new Uint8Array([1, 2, 3, 4]), 3, -2)).toEqual(new Uint8Array([1, 4]));
    expect(dropByteRange(new Uint8Array([1, 2, 3, 4]), -1, -2)).toEqual(new Uint8Array([1, 4]));
    expect(dropByteRange(new Uint8Array([1, 2, 3, 4]), -5, -2)).toEqual(new Uint8Array([1]));
    expect(takeByteRange(new Uint8Array([1, 2, 3, 4]), 3, -2)).toEqual(new Uint8Array([2, 3]));

    expect(dropNth(new Uint8Array([1, 2, 3]), 2, 0)).toEqual(new Uint8Array([2]));
    expect(takeNth(new Uint8Array([1, 2, 3]), 2, 0)).toEqual(new Uint8Array([1, 3]));
    expect(() => dropNth(new Uint8Array([1]), 0, 0)).toThrow("positive integer");
    expect(() => dropNth(new Uint8Array([1]), 1, -1)).toThrow("positive or zero integer");
    expect(() => takeNth(new Uint8Array([1]), 0, 0)).toThrow("positive integer");
    expect(() => takeNth(new Uint8Array([1]), 1, -1)).toThrow("positive or zero integer");
  });

  it("covers Modhex helper edge cases", () => {
    expect(encodeModhex(new Uint8Array([0x01]))).toBe("cb");
    expect(decodeModhex("")).toEqual(new Uint8Array());
    expect(() => decodeModhex("zz")).toThrow("Invalid Modhex character");
  });

  it("covers remaining operation guards and defaults", () => {
    expect(fromBinary.run({ input: { type: "string", value: "   " }, args: { delimiter: "" } })).toEqual({
      type: "bytes",
      value: new Uint8Array()
    });
    expect(() =>
      fromBinary.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })
    ).toThrow("Expected string input");

    expect(fromCharcode.run({ input: { type: "string", value: "" }, args: {} })).toEqual({
      type: "bytes",
      value: new Uint8Array()
    });
    expect(() =>
      fromCharcode.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })
    ).toThrow("Expected string input");
    expect(() =>
      fromCharcode.run({ input: { type: "string", value: "abc" }, args: {} })
    ).toThrow("Invalid charcode token");

    expect(fromDecimal.run({ input: { type: "string", value: "" }, args: {} })).toEqual({
      type: "bytes",
      value: new Uint8Array()
    });
    expect(() =>
      fromDecimal.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })
    ).toThrow("Expected string input");
    expect(() =>
      fromDecimal.run({ input: { type: "string", value: "abc" }, args: {} })
    ).toThrow("Invalid decimal token");

    expect(fromOctal.run({ input: { type: "string", value: "" }, args: {} })).toEqual({
      type: "bytes",
      value: new Uint8Array()
    });
    expect(() =>
      fromOctal.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })
    ).toThrow("Expected string input");
    expect(() =>
      fromOctal.run({ input: { type: "string", value: "777" }, args: {} })
    ).toThrow("Octal byte out of range");

    expect(() =>
      toMorseCode.run({ input: { type: "string", value: "é" }, args: {} })
    ).toThrow("Unsupported Morse character");
    expect(() =>
      toMorseCode.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })
    ).toThrow("Expected string input");
    expect(
      fromMorseCode.run({ input: { type: "string", value: "   " }, args: {} })
    ).toEqual({ type: "string", value: "" });
    expect(
      fromMorseCode.run({
        input: { type: "string", value: "..." },
        args: { letterDelimiter: "", wordDelimiter: "" }
      })
    ).toEqual({ type: "string", value: "S" });
    expect(() =>
      fromMorseCode.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })
    ).toThrow("Expected string input");

    expect(() => toPunycode.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })).toThrow(
      "Expected string input"
    );
    expect(() =>
      fromPunycode.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })
    ).toThrow("Expected string input");

    expect(() => toModhex.run({ input: { type: "json", value: {} } as never, args: {} })).toThrow(
      "Expected bytes or string input"
    );
    expect(() =>
      fromModhex.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })
    ).toThrow("Expected string input");

    expect(() => toBraille.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })).toThrow(
      "Expected string input"
    );
    expect(() =>
      fromBraille.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })
    ).toThrow("Expected string input");

    expect(() =>
      toBase92.run({ input: { type: "json", value: {} } as never, args: {} })
    ).toThrow("Expected bytes or string input");
    expect(() =>
      fromBase92.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })
    ).toThrow("Expected string input");
    expect(() =>
      toOctal.run({ input: { type: "json", value: {} } as never, args: {} })
    ).toThrow("Expected bytes or string input");
    expect(
      toOctal.run({ input: { type: "string", value: "A" }, args: {} })
    ).toEqual({ type: "string", value: "101" });
  });

  it("covers default-arg fallbacks in byte operations", () => {
    expect(
      dropBytes.run({
        input: { type: "bytes", value: new Uint8Array([1, 2, 3, 4, 5]) },
        args: { start: "x", length: "y", applyToEachLine: false }
      } as never)
    ).toEqual({ type: "bytes", value: new Uint8Array() });

    expect(
      takeBytes.run({
        input: { type: "bytes", value: new Uint8Array([1, 2, 3, 4, 5]) },
        args: { start: "x", length: "y", applyToEachLine: false }
      } as never)
    ).toEqual({ type: "bytes", value: new Uint8Array([1, 2, 3, 4, 5]) });

    expect(
      dropNthBytes.run({
        input: { type: "bytes", value: new Uint8Array([1, 2, 3, 4, 5]) },
        args: { every: "x", startingAt: "y", applyToEachLine: false }
      } as never)
    ).toEqual({ type: "bytes", value: new Uint8Array([2, 3, 4]) });

    expect(
      takeNthBytes.run({
        input: { type: "bytes", value: new Uint8Array([1, 2, 3, 4, 5]) },
        args: { every: "x", startingAt: "y", applyToEachLine: false }
      } as never)
    ).toEqual({ type: "bytes", value: new Uint8Array([1, 5]) });
  });
});
