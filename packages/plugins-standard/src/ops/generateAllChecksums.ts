import type { Operation } from "@cybermasterchef/core";

const MOD_ADLER = 65521;

function adler32(bytes: Uint8Array): string {
  let a = 1;
  let b = 0;
  for (const byte of bytes) {
    a = (a + byte) % MOD_ADLER;
    b = (b + a) % MOD_ADLER;
  }
  return (((b << 16) | a) >>> 0).toString(16).padStart(8, "0");
}

function xorChecksum(bytes: Uint8Array): string {
  let checksum = 0;
  for (const byte of bytes) {
    checksum ^= byte;
  }
  return (checksum & 0xff).toString(16).padStart(2, "0");
}

function tcpIpChecksum(bytes: Uint8Array): string {
  let sum = 0;
  for (let index = 0; index < bytes.length; index += 2) {
    const word = (bytes[index]! << 8) | (bytes[index + 1] ?? 0);
    sum += word;
    while (sum > 0xffff) {
      sum = (sum & 0xffff) + (sum >>> 16);
    }
  }
  return ((~sum) & 0xffff).toString(16).padStart(4, "0");
}

function fletcher16(bytes: Uint8Array): string {
  let sum1 = 0;
  let sum2 = 0;
  for (const byte of bytes) {
    sum1 = (sum1 + byte) % 255;
    sum2 = (sum2 + sum1) % 255;
  }
  return (((sum2 << 8) | sum1) & 0xffff).toString(16).padStart(4, "0");
}

export const generateAllChecksumsOp: Operation = {
  id: "hash.generateAllChecksums",
  name: "Generate All Checksums",
  description: "Generates a deterministic checksum and digest summary for the input.",
  input: ["bytes", "string"],
  output: "json",
  args: [],
  run: async ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const { crc32, crc64, md5, sha1, sha256 } = (await import("hash-wasm")) as {
      crc32: (data: Uint8Array) => Promise<string>;
      crc64: (data: Uint8Array) => Promise<string>;
      md5: (data: Uint8Array) => Promise<string>;
      sha1: (data: Uint8Array) => Promise<string>;
      sha256: (data: Uint8Array) => Promise<string>;
    };

    return {
      type: "json",
      value: {
        adler32: adler32(bytes),
        crc32: await crc32(bytes),
        crc64: await crc64(bytes),
        fletcher16: fletcher16(bytes),
        xorChecksum: xorChecksum(bytes),
        tcpIpChecksum: tcpIpChecksum(bytes),
        md5: await md5(bytes),
        sha1: await sha1(bytes),
        sha256: await sha256(bytes)
      }
    };
  }
};
