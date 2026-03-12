import { describe, expect, it } from "vitest";
import type { Operation } from "@cybermasterchef/core";
import {
  releaseParityAliasOps,
  encodeText,
  decodeText,
  objectIdentifierToHex,
  hexToObjectIdentifier,
  pemToHex,
  hexToPem,
  commentOp,
  swapEndianness,
  hammingDistance
} from "../src/ops/releaseParityAliasOps.js";

const encoder = new TextEncoder();
const tcpPacket = new Uint8Array([
  0x00, 0x50, 0x01, 0xbb, 0x11, 0x22, 0x33, 0x44,
  0x55, 0x66, 0x77, 0x88, 0x50, 0x12, 0x20, 0x00,
  0x1f, 0x90, 0x00, 0x00, 0xde, 0xad
]);
const udpPacket = new Uint8Array([0x13, 0x89, 0x00, 0x35, 0x00, 0x0a, 0xab, 0xcd, 0x6f, 0x6b]);
const ipv4Packet = new Uint8Array([
  0x45, 0x00, 0x00, 0x16, 0x00, 0x00, 0x40, 0x00,
  0x40, 0x11, 0x00, 0x00, 0x7f, 0x00, 0x00, 0x01,
  0x7f, 0x00, 0x00, 0x01, 0xca, 0xfe
]);
const httpMessage = encoder.encode("HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nbody");
const pemBlock = "-----BEGIN TEST-----\nAQID\n-----END TEST-----";

function findOp(id: string): Operation {
  const op = releaseParityAliasOps.find((candidate) => candidate.id === id);
  if (!op) throw new Error(`Unknown operation ${id}`);
  return op;
}

async function runOp(
  op: Operation,
  input:
    | { type: "string"; value: string }
    | { type: "bytes"; value: Uint8Array }
    | { type: "json"; value: unknown },
  args: Record<string, unknown> = {}
) {
  return Promise.resolve(op.run({ input, args } as never));
}

describe("release parity alias operations", () => {
  it("executes the alias wave operations", async () => {
    const cases: Array<{
      id: string;
      input: { type: "string"; value: string } | { type: "bytes"; value: Uint8Array };
      args?: Record<string, unknown>;
      expectType: "string" | "bytes" | "json";
    }> = [
      { id: "network.urlEncode", input: { type: "string", value: "a b" }, expectType: "string" },
      { id: "network.urlDecode", input: { type: "string", value: "a%20b" }, expectType: "string" },
      { id: "network.extractURLs", input: { type: "string", value: "https://a.test https://a.test" }, expectType: "string" },
      { id: "network.parseURI", input: { type: "string", value: "https://user:pw@example.test:8443/a?x=1#frag" }, expectType: "json" },
      { id: "network.parseIPv6", input: { type: "string", value: "2001:db8::1" }, expectType: "json" },
      { id: "network.stripTCPHeader", input: { type: "bytes", value: tcpPacket }, expectType: "bytes" },
      { id: "network.stripUDPHeader", input: { type: "bytes", value: udpPacket }, expectType: "bytes" },
      { id: "network.stripHTTPHeaders", input: { type: "bytes", value: httpMessage }, expectType: "bytes" },
      { id: "network.stripIpHeader", input: { type: "bytes", value: ipv4Packet }, expectType: "bytes" },
      { id: "forensic.analyseUUID", input: { type: "string", value: "550e8400-e29b-41d4-a716-446655440000" }, expectType: "json" },
      { id: "forensic.chiSquareStatistic", input: { type: "string", value: "hello" }, expectType: "string" },
      {
        id: "forensic.generateUUID",
        input: { type: "string", value: "demo" },
        args: { version: "v5", namespace: "6ba7b810-9dad-11d1-80b4-00c04fd430c8" },
        expectType: "string"
      },
      { id: "forensic.strings", input: { type: "bytes", value: encoder.encode("abc\u0000XYZ") }, expectType: "string" },
      { id: "misc.sum", input: { type: "string", value: "1 2 3" }, expectType: "string" },
      { id: "misc.subtract", input: { type: "string", value: "7 2 1" }, expectType: "string" },
      { id: "misc.multiply", input: { type: "string", value: "3 4 2" }, expectType: "string" },
      { id: "misc.divide", input: { type: "string", value: "8 2" }, expectType: "string" },
      { id: "misc.escapeString", input: { type: "string", value: "a\tb" }, expectType: "string" },
      { id: "misc.expandAlphabetRange", input: { type: "string", value: "a-d" }, expectType: "string" },
      { id: "misc.alternatingCaps", input: { type: "string", value: "hello" }, expectType: "string" },
      { id: "misc.toFloat", input: { type: "string", value: "1.5" }, expectType: "bytes" },
      {
        id: "misc.fromFloat",
        input: { type: "bytes", value: new Uint8Array([0x3f, 0xc0, 0x00, 0x00]) },
        expectType: "string"
      },
      { id: "crypto.atbash", input: { type: "string", value: "abc" }, expectType: "string" },
      {
        id: "crypto.affineEncode",
        input: { type: "string", value: "abc" },
        args: { a: 5, b: 8 },
        expectType: "string"
      },
      {
        id: "crypto.affineDecode",
        input: { type: "string", value: "ins" },
        args: { a: 5, b: 8 },
        expectType: "string"
      },
      { id: "crypto.a1z26Encode", input: { type: "string", value: "abc" }, expectType: "string" },
      { id: "crypto.a1z26Decode", input: { type: "string", value: "1 2 3" }, expectType: "string" },
      { id: "crypto.baconEncode", input: { type: "string", value: "abc" }, expectType: "string" },
      { id: "crypto.baconDecode", input: { type: "string", value: "AAAAA AAAAB AAABA" }, expectType: "string" },
      { id: "hash.sha1Digest", input: { type: "string", value: "hello" }, expectType: "string" },
      { id: "hash.sha224Digest", input: { type: "string", value: "hello" }, expectType: "string" },
      { id: "hash.sha256Digest", input: { type: "string", value: "hello" }, expectType: "string" },
      { id: "hash.sha384Digest", input: { type: "string", value: "hello" }, expectType: "string" },
      { id: "hash.sha512Digest", input: { type: "string", value: "hello" }, expectType: "string" },
      { id: "hash.md5Digest", input: { type: "string", value: "hello" }, expectType: "string" },
      { id: "hash.ripemd160Digest", input: { type: "string", value: "hello" }, expectType: "string" },
      { id: "hash.blake2b512", input: { type: "string", value: "hello" }, expectType: "string" },
      { id: "hash.blake2s256", input: { type: "string", value: "hello" }, expectType: "string" },
      {
        id: "crypto.hmacSha1Legacy",
        input: { type: "string", value: "hello" },
        args: { key: "secret", keyEncoding: "utf8" },
        expectType: "string"
      },
      {
        id: "crypto.hkdfLegacy",
        input: { type: "string", value: "hello" },
        args: { salt: "salt", saltEncoding: "utf8", info: "ctx", infoEncoding: "utf8", length: 16, hash: "SHA-256" },
        expectType: "string"
      },
      {
        id: "crypto.pbkdf2Legacy",
        input: { type: "string", value: "hello" },
        args: { salt: "salt", saltEncoding: "utf8", iterations: 1000, length: 16, hash: "SHA-256" },
        expectType: "string"
      },
      {
        id: "crypto.scryptLegacy",
        input: { type: "string", value: "hello" },
        args: { salt: "salt", saltEncoding: "utf8", length: 16, costN: 1024, blockSizeR: 8, parallelizationP: 1, maxmem: 16777216 },
        expectType: "string"
      }
    ];

    for (const testCase of cases) {
      const result = await runOp(findOp(testCase.id), testCase.input, testCase.args);
      expect(result.type).toBe(testCase.expectType);
    }
  });

  it("covers the explicit parity helper operations and branches", async () => {
    await expect(runOp(encodeText, { type: "string", value: "Hi" }, { encoding: "utf8" })).resolves.toEqual({
      type: "bytes",
      value: encoder.encode("Hi")
    });
    await expect(runOp(encodeText, { type: "string", value: "Hi" }, { encoding: "utf-16le" })).resolves.toEqual({
      type: "bytes",
      value: new Uint8Array([0x48, 0x00, 0x69, 0x00])
    });
    await expect(runOp(encodeText, { type: "string", value: "Hi" }, { encoding: "utf-16be" })).resolves.toEqual({
      type: "bytes",
      value: new Uint8Array([0x00, 0x48, 0x00, 0x69])
    });
    await expect(runOp(decodeText, { type: "bytes", value: new Uint8Array([0x48, 0x69]) }, {})).resolves.toEqual({
      type: "string",
      value: "Hi"
    });
    await expect(runOp(decodeText, { type: "bytes", value: new Uint8Array([0x48, 0x00, 0x69, 0x00]) }, { encoding: "utf16le" })).resolves.toEqual({
      type: "string",
      value: "Hi"
    });
    await expect(runOp(decodeText, { type: "bytes", value: new Uint8Array([0x48, 0x00, 0x69, 0x00]) }, { encoding: "utf-16le" })).resolves.toEqual({
      type: "string",
      value: "Hi"
    });
    await expect(runOp(decodeText, { type: "bytes", value: new Uint8Array([0x00, 0x48, 0x00, 0x69]) }, { encoding: "utf16be" })).resolves.toEqual({
      type: "string",
      value: "Hi"
    });
    await expect(runOp(decodeText, { type: "bytes", value: new Uint8Array([0x00, 0x48, 0x00, 0x69]) }, { encoding: "utf-16be" })).resolves.toEqual({
      type: "string",
      value: "Hi"
    });
    await expect(runOp(decodeText, { type: "string", value: "Hi" }, { encoding: "utf8" })).resolves.toEqual({
      type: "string",
      value: "Hi"
    });
    await expect(runOp(objectIdentifierToHex, { type: "string", value: "1.2.840.113549" })).resolves.toEqual({
      type: "string",
      value: "2a864886f70d"
    });
    await expect(runOp(hexToObjectIdentifier, { type: "string", value: "2a864886f70d" })).resolves.toEqual({
      type: "string",
      value: "1.2.840.113549"
    });
    await expect(runOp(hexToObjectIdentifier, { type: "bytes", value: new Uint8Array([0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d]) })).resolves.toEqual({
      type: "string",
      value: "1.2.840.113549"
    });
    await expect(runOp(pemToHex, { type: "string", value: pemBlock })).resolves.toEqual({
      type: "string",
      value: "010203"
    });
    await expect(runOp(hexToPem, { type: "string", value: "010203" }, { header: "TEST" })).resolves.toEqual({
      type: "string",
      value: "-----BEGIN TEST-----\nAQID\n-----END TEST-----"
    });
    await expect(runOp(hexToPem, { type: "bytes", value: new Uint8Array([0x01, 0x02, 0x03]) }, { header: " " })).resolves.toEqual({
      type: "string",
      value: "-----BEGIN CERTIFICATE-----\nAQID\n-----END CERTIFICATE-----"
    });
    await expect(runOp(commentOp, { type: "string", value: "demo" })).resolves.toEqual({
      type: "string",
      value: "demo"
    });
    await expect(runOp(commentOp, { type: "bytes", value: encoder.encode("demo") })).resolves.toEqual({
      type: "string",
      value: "demo"
    });
    await expect(runOp(commentOp, { type: "json", value: { ok: true } }, {})).resolves.toEqual({
      type: "string",
      value: "{\"ok\":true}"
    });
    await expect(runOp(swapEndianness, { type: "bytes", value: new Uint8Array([0x12, 0x34, 0xab, 0xcd]) }, { wordSize: 2 })).resolves.toEqual({
      type: "bytes",
      value: new Uint8Array([0x34, 0x12, 0xcd, 0xab])
    });
    await expect(runOp(swapEndianness, { type: "string", value: "1234abcd" }, { wordSize: 4 })).resolves.toEqual({
      type: "bytes",
      value: new Uint8Array([0xcd, 0xab, 0x34, 0x12])
    });
    await expect(runOp(swapEndianness, { type: "bytes", value: new Uint8Array([0x12, 0x34, 0xab, 0xcd]) }, { wordSize: 1 })).resolves.toEqual({
      type: "bytes",
      value: new Uint8Array([0x34, 0x12, 0xcd, 0xab])
    });
    await expect(runOp(swapEndianness, { type: "bytes", value: new Uint8Array([0x12, 0x34, 0xab, 0xcd]) })).resolves.toEqual({
      type: "bytes",
      value: new Uint8Array([0x34, 0x12, 0xcd, 0xab])
    });
    await expect(runOp(hammingDistance, { type: "string", value: "karolin" }, { other: "kathrin" })).resolves.toEqual({
      type: "string",
      value: "3"
    });
    await expect(runOp(hammingDistance, { type: "string", value: "" }, {})).resolves.toEqual({
      type: "string",
      value: "0"
    });
  });

  it("covers error branches for the parity helper operations", async () => {
    expect(() => encodeText.run({ input: { type: "bytes", value: encoder.encode("x") }, args: {} } as never)).toThrow("Expected string input");
    await expect(runOp(encodeText, { type: "string", value: "x" }, { encoding: "latin1" })).rejects.toThrow("Unsupported text encoding");
    expect(() => decodeText.run({ input: { type: "json", value: { x: 1 } }, args: {} } as never)).toThrow("Expected bytes or string input");
    await expect(runOp(decodeText, { type: "bytes", value: new Uint8Array([0x00]) }, { encoding: "utf16le" })).rejects.toThrow("UTF-16 input must contain an even number of bytes");
    await expect(runOp(decodeText, { type: "bytes", value: new Uint8Array([0x00]) }, { encoding: "utf16be" })).rejects.toThrow("UTF-16 input must contain an even number of bytes");
    await expect(runOp(decodeText, { type: "bytes", value: new Uint8Array([0x41]) }, { encoding: "latin1" })).rejects.toThrow("Unsupported text encoding");
    expect(() => objectIdentifierToHex.run({ input: { type: "bytes", value: encoder.encode("1.2.3") }, args: {} } as never)).toThrow("Expected string input");
    await expect(runOp(objectIdentifierToHex, { type: "string", value: "1" })).rejects.toThrow("OID must contain at least two arcs");
    expect(() => objectIdentifierToHex.run({ input: { type: "string", value: "3.1" }, args: {} } as never)).toThrow("OID first arc must be 0, 1, or 2");
    expect(() => objectIdentifierToHex.run({ input: { type: "string", value: "1.40.1" }, args: {} } as never)).toThrow("OID second arc must be between 0 and 39");
    await expect(runOp(objectIdentifierToHex, { type: "string", value: "1.2.9007199254740993" })).rejects.toThrow("OID arcs must be safe positive integers");
    expect(() => hexToObjectIdentifier.run({ input: { type: "json", value: { x: 1 } }, args: {} } as never)).toThrow("Expected bytes or string input");
    await expect(runOp(hexToObjectIdentifier, { type: "string", value: "" })).rejects.toThrow("OID hex input cannot be empty");
    await expect(runOp(hexToObjectIdentifier, { type: "string", value: "2a86" })).rejects.toThrow("OID hex input ended mid-arc");
    expect(() => pemToHex.run({ input: { type: "bytes", value: new Uint8Array([1, 2, 3]) }, args: {} } as never)).toThrow("Expected string input");
    expect(() => hexToPem.run({ input: { type: "json", value: { x: 1 } }, args: {} } as never)).toThrow("Expected bytes or string input");
    await expect(runOp(hexToPem, { type: "string", value: "abc" })).rejects.toThrow("Expected even-length hexadecimal input");
    await expect(runOp(pemToHex, { type: "string", value: "no pem" })).rejects.toThrow("No PEM block found");
    expect(() => swapEndianness.run({ input: { type: "json", value: { x: 1 } }, args: { wordSize: 2 } } as never)).toThrow("Expected bytes or string input");
    await expect(runOp(swapEndianness, { type: "string", value: "zz" }, { wordSize: 2 })).rejects.toThrow("Expected even-length hexadecimal input");
    await expect(runOp(swapEndianness, { type: "bytes", value: new Uint8Array([1, 2, 3]) }, { wordSize: 2 })).rejects.toThrow("Input length must be divisible by the word size");
    await expect(runOp(swapEndianness, { type: "bytes", value: new Uint8Array([1, 2]) }, { wordSize: 2.5 })).rejects.toThrow("Word size must be an integer");
    expect(() => hammingDistance.run({ input: { type: "bytes", value: encoder.encode("x") }, args: { other: "x" } } as never)).toThrow("Expected string input");
    await expect(runOp(hammingDistance, { type: "string", value: "abc" }, { other: "ab" })).rejects.toThrow("Inputs must be the same length");
  });
});
