import { describe, expect, it } from "vitest";
import { base64ToBytes, bytesToBase64, bytesToHex, hexToBytes } from "../src/index.js";

describe("core codec utils", () => {
  it("round-trips base64 helpers", () => {
    const bytes = new Uint8Array([0x00, 0x68, 0x69, 0xff]);
    const encoded = bytesToBase64(bytes);

    expect(encoded).toBe("AGhp/w==");
    expect(base64ToBytes(encoded)).toEqual(bytes);
  });

  it("round-trips hex helpers and rejects odd input", () => {
    const bytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);

    expect(bytesToHex(bytes)).toBe("deadbeef");
    expect(hexToBytes("de ad be ef")).toEqual(bytes);
    expect(() => hexToBytes("abc")).toThrow("Hex string length must be even");
  });
});
