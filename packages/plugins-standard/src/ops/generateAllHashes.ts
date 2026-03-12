import type { Operation } from "@cybermasterchef/core";

export const generateAllHashesOp: Operation = {
  id: "hash.generateAllHashes",
  name: "Generate All Hashes",
  description: "Computes a deterministic set of common hash digests and returns them as JSON.",
  input: ["bytes", "string"],
  output: "json",
  args: [],
  run: async ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }

    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const {
      md4,
      md5,
      ripemd160,
      sha1,
      sha224,
      sha256,
      sha384,
      sha512,
      sha3,
      blake2b,
      blake2s,
      blake3,
      sm3,
      whirlpool
    } = (await import("hash-wasm")) as {
      md4: (data: Uint8Array) => Promise<string>;
      md5: (data: Uint8Array) => Promise<string>;
      ripemd160: (data: Uint8Array) => Promise<string>;
      sha1: (data: Uint8Array) => Promise<string>;
      sha224: (data: Uint8Array) => Promise<string>;
      sha256: (data: Uint8Array) => Promise<string>;
      sha384: (data: Uint8Array) => Promise<string>;
      sha512: (data: Uint8Array) => Promise<string>;
      sha3: (data: Uint8Array, bits?: 224 | 256 | 384 | 512) => Promise<string>;
      blake2b: (data: Uint8Array, bits?: number) => Promise<string>;
      blake2s: (data: Uint8Array, bits?: number) => Promise<string>;
      blake3: (data: Uint8Array) => Promise<string>;
      sm3: (data: Uint8Array) => Promise<string>;
      whirlpool: (data: Uint8Array) => Promise<string>;
    };

    return {
      type: "json",
      value: {
        md4: await md4(bytes),
        md5: await md5(bytes),
        ripemd160: await ripemd160(bytes),
        sha1: await sha1(bytes),
        sha224: await sha224(bytes),
        sha256: await sha256(bytes),
        sha384: await sha384(bytes),
        sha512: await sha512(bytes),
        sha3_256: await sha3(bytes, 256),
        sha3_512: await sha3(bytes, 512),
        blake2b: await blake2b(bytes, 512),
        blake2s: await blake2s(bytes, 256),
        blake3: await blake3(bytes),
        sm3: await sm3(bytes),
        whirlpool: await whirlpool(bytes)
      }
    };
  }
};
