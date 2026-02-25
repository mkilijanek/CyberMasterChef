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
import { hashMd5 } from "../src/ops/hashMd5.js";
import { sha1 } from "../src/ops/sha1.js";
import { sha384 } from "../src/ops/sha384.js";
import { sha512 } from "../src/ops/sha512.js";
import { sha3_256 } from "../src/ops/sha3_256.js";
import { sha3_512 } from "../src/ops/sha3_512.js";
import { blake2b } from "../src/ops/blake2b.js";
import { blake2s } from "../src/ops/blake2s.js";
import { hmacSha1 } from "../src/ops/hmacSha1.js";
import { hmacSha256 } from "../src/ops/hmacSha256.js";
import { hmacSha512 } from "../src/ops/hmacSha512.js";
import { pbkdf2 } from "../src/ops/pbkdf2.js";

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

  it("computes common hashes", async () => {
    const registry = new InMemoryRegistry();
    registry.register(hashMd5);
    registry.register(sha1);
    registry.register(sha384);
    registry.register(sha512);
    registry.register(sha3_256);
    registry.register(sha3_512);
    registry.register(blake2b);
    registry.register(blake2s);

    const input = { type: "string", value: "hello" } as const;
    const ops = [
      { opId: "hash.md5", expected: "5d41402abc4b2a76b9719d911017c592" },
      { opId: "hash.sha1", expected: "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d" },
      {
        opId: "hash.sha384",
        expected:
          "59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f"
      },
      {
        opId: "hash.sha512",
        expected:
          "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043"
      },
      {
        opId: "hash.sha3_256",
        expected: "3338be694f50c5f338814986cdf0686453a888b84f424d792af4b9202398f392"
      },
      {
        opId: "hash.sha3_512",
        expected:
          "75d527c368f2efe848ecf6b073a36767800805e9eef2b1857d5f984f036eb6df891d75f72d9b154518c1cd58835286d1da9a38deba3de98b5a53e5ed78a84976"
      },
      {
        opId: "hash.blake2b",
        expected:
          "e4cfa39a3d37be31c59609e807970799caa68a19bfaa15135f165085e01d41a65ba1e1b146aeb6bd0092b49eac214c103ccfa3a365954bbbe52f74a2b3620c94"
      },
      {
        opId: "hash.blake2s",
        expected: "19213bacc58dee6dbde3ceb9a47cbb330b3d86f8cca8997eb00be456f140ca25"
      }
    ];

    for (const { opId, expected } of ops) {
      const recipe: Recipe = { version: 1, steps: [{ opId }] };
      const out = await runRecipe({ registry, recipe, input });
      expect(out.output).toEqual({ type: "string", value: expected });
    }
  });

  it("computes HMAC digests", async () => {
    const registry = new InMemoryRegistry();
    registry.register(hmacSha1);
    registry.register(hmacSha256);
    registry.register(hmacSha512);

    const input = { type: "string", value: "hello" } as const;
    const ops = [
      {
        opId: "crypto.hmacSha1",
        expected: "b34ceac4516ff23a143e61d79d0fa7a4fbe5f266"
      },
      {
        opId: "crypto.hmacSha256",
        expected: "9307b3b915efb5171ff14d8cb55fbcc798c6c0ef1456d66ded1a6aa723a58b7b"
      },
      {
        opId: "crypto.hmacSha512",
        expected:
          "ff06ab36757777815c008d32c8e14a705b4e7bf310351a06a23b612dc4c7433e7757d20525a5593b71020ea2ee162d2311b247e9855862b270122419652c0c92"
      }
    ];

    for (const { opId, expected } of ops) {
      const recipe: Recipe = {
        version: 1,
        steps: [{ opId, args: { key: "key", keyEncoding: "utf8" } }]
      };
      const out = await runRecipe({ registry, recipe, input });
      expect(out.output).toEqual({ type: "string", value: expected });
    }
  });

  it("derives PBKDF2 keys", async () => {
    const registry = new InMemoryRegistry();
    registry.register(pbkdf2);
    const recipe: Recipe = {
      version: 1,
      steps: [
        {
          opId: "crypto.pbkdf2",
          args: { salt: "salt", saltEncoding: "utf8", iterations: 1000, length: 32, hash: "SHA-256" }
        }
      ]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "password" }
    });
    expect(out.output).toEqual({
      type: "string",
      value: "632c2812e46d4604102ba7618e9d6d7d2f8128f6266b4a03264d2a0460b7dcb3"
    });
  });
});
