import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { adler32Checksum } from "../src/ops/adler32.js";
import { crc32Checksum } from "../src/ops/crc32.js";
import { crc64Checksum } from "../src/ops/crc64.js";
import { fletcher8Checksum } from "../src/ops/fletcher8.js";
import { fletcher16Checksum } from "../src/ops/fletcher16.js";
import { fletcher32Checksum } from "../src/ops/fletcher32.js";
import { fletcher64Checksum } from "../src/ops/fletcher64.js";
import { analyseHash } from "../src/ops/analyseHash.js";
import { atbashCipher } from "../src/ops/atbashCipher.js";
import { affineCipherEncode } from "../src/ops/affineCipherEncode.js";
import { affineCipherDecode } from "../src/ops/affineCipherDecode.js";
import { a1z26CipherEncode } from "../src/ops/a1z26CipherEncode.js";
import { a1z26CipherDecode } from "../src/ops/a1z26CipherDecode.js";
import { baconCipherEncode } from "../src/ops/baconCipherEncode.js";
import { baconCipherDecode } from "../src/ops/baconCipherDecode.js";
import { bcryptParse } from "../src/ops/bcryptParse.js";
import { bcryptVerify } from "../src/ops/bcryptVerify.js";
import { hashMd5 } from "../src/ops/hashMd5.js";
import { md4 } from "../src/ops/md4.js";
import { ripemd160 } from "../src/ops/ripemd160.js";
import { sha1 } from "../src/ops/sha1.js";
import { sha224 } from "../src/ops/sha224.js";
import { sha384 } from "../src/ops/sha384.js";
import { sha512 } from "../src/ops/sha512.js";
import { sha3_256 } from "../src/ops/sha3_256.js";
import { sha3_512 } from "../src/ops/sha3_512.js";
import { blake2b } from "../src/ops/blake2b.js";
import { blake2s } from "../src/ops/blake2s.js";
import { blake3 } from "../src/ops/blake3.js";
import { keccak } from "../src/ops/keccak.js";
import { sm3 } from "../src/ops/sm3.js";
import { whirlpool } from "../src/ops/whirlpool.js";
import { xxhash32 } from "../src/ops/xxhash32.js";
import { xxhash64 } from "../src/ops/xxhash64.js";
import { xxhash3 } from "../src/ops/xxhash3.js";
import { xxhash128 } from "../src/ops/xxhash128.js";
import { hmacSha1 } from "../src/ops/hmacSha1.js";
import { hmacSha224 } from "../src/ops/hmacSha224.js";
import { hmacSha256 } from "../src/ops/hmacSha256.js";
import { hmacSha384 } from "../src/ops/hmacSha384.js";
import { hmacSha512 } from "../src/ops/hmacSha512.js";
import { hmacMd5 } from "../src/ops/hmacMd5.js";
import { hmacRipemd160 } from "../src/ops/hmacRipemd160.js";
import { hmacWhirlpool } from "../src/ops/hmacWhirlpool.js";
import { hkdf } from "../src/ops/hkdf.js";
import { pbkdf2 } from "../src/ops/pbkdf2.js";
import { scrypt } from "../src/ops/scrypt.js";
import { argon2d } from "../src/ops/argon2d.js";
import { argon2i } from "../src/ops/argon2i.js";
import { argon2id } from "../src/ops/argon2id.js";
import { argon2Verify } from "../src/ops/argon2Verify.js";

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

  it("computes CRC-32 checksum", async () => {
    const registry = new InMemoryRegistry();
    registry.register(crc32Checksum);
    const recipe: Recipe = { version: 1, steps: [{ opId: "hash.crc32" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "abc" }
    });
    expect(out.output).toEqual({ type: "string", value: "352441c2" });
  });

  it("computes CRC-64 checksum", async () => {
    const registry = new InMemoryRegistry();
    registry.register(crc64Checksum);
    const recipe: Recipe = { version: 1, steps: [{ opId: "hash.crc64" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "hello" }
    });
    expect(out.output).toEqual({ type: "string", value: "9b1edae5dbb937b1" });
  });

  it("computes Fletcher checksums", async () => {
    const input = { type: "string", value: "abc" } as const;
    const ops = [
      { op: fletcher8Checksum, opId: "hash.fletcher8", expected: "19" },
      { op: fletcher16Checksum, opId: "hash.fletcher16", expected: "4c27" },
      { op: fletcher32Checksum, opId: "hash.fletcher32", expected: "25c5c462" },
      { op: fletcher64Checksum, opId: "hash.fletcher64", expected: "6162630061626300" }
    ];

    for (const { op, opId, expected } of ops) {
      const registry = new InMemoryRegistry();
      registry.register(op);
      const recipe: Recipe = { version: 1, steps: [{ opId }] };
      const out = await runRecipe({ registry, recipe, input });
      expect(out.output).toEqual({ type: "string", value: expected });
    }
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

  it("verifies bcrypt hash", async () => {
    const registry = new InMemoryRegistry();
    registry.register(bcryptVerify);
    const hash = "$2a$04$..CA.uOD/eaGAOmJB.yMBubqEtzdkvfegxfotQ8UAMQWLlq7JbHJW";

    const ok = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "crypto.bcryptVerify", args: { hash } }] },
      input: { type: "string", value: "password" }
    });
    expect(ok.output).toEqual({ type: "json", value: { matches: true } });

    const bad = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "crypto.bcryptVerify", args: { hash } }] },
      input: { type: "bytes", value: new TextEncoder().encode("wrong") }
    });
    expect(bad.output).toEqual({ type: "json", value: { matches: false } });
  });

  it("computes common hashes", async () => {
    const registry = new InMemoryRegistry();
    registry.register(hashMd5);
    registry.register(md4);
    registry.register(ripemd160);
    registry.register(sha1);
    registry.register(sha224);
    registry.register(sha384);
    registry.register(sha512);
    registry.register(sha3_256);
    registry.register(sha3_512);
    registry.register(blake2b);
    registry.register(blake2s);
    registry.register(blake3);
    registry.register(keccak);
    registry.register(sm3);
    registry.register(whirlpool);
    registry.register(xxhash32);
    registry.register(xxhash64);
    registry.register(xxhash3);
    registry.register(xxhash128);

    const input = { type: "string", value: "hello" } as const;
    const ops = [
      { opId: "hash.md5", expected: "5d41402abc4b2a76b9719d911017c592" },
      { opId: "hash.md4", expected: "866437cb7a794bce2b727acc0362ee27" },
      { opId: "hash.ripemd160", expected: "108f07b8382412612c048d07d13f814118445acd" },
      { opId: "hash.sha1", expected: "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d" },
      {
        opId: "hash.sha224",
        expected: "ea09ae9cc6768c50fcee903ed054556e5bfc8347907f12598aa24193"
      },
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
      },
      {
        opId: "hash.blake3",
        expected: "ea8f163db38682925e4491c5e58d4bb3506ef8c14eb78a86e908c5624a67200f"
      },
      {
        opId: "hash.sm3",
        expected: "becbbfaae6548b8bf0cfcad5a27183cd1be6093b1cceccc303d9c61d0a645268"
      },
      {
        opId: "hash.whirlpool",
        expected:
          "0a25f55d7308eca6b9567a7ed3bd1b46327f0f1ffdc804dd8bb5af40e88d78b88df0d002a89e2fdbd5876c523f1b67bc44e9f87047598e7548298ea1c81cfd73"
      },
      {
        opId: "hash.xxhash32",
        expected: "fb0077f9"
      },
      {
        opId: "hash.xxhash64",
        expected: "26c7827d889f6da3"
      },
      {
        opId: "hash.xxhash3",
        expected: "9555e8555c62dcfd"
      },
      {
        opId: "hash.xxhash128",
        expected: "b5e9c1ad071b3e7fc779cfaa5e523818"
      }
    ];

    for (const { opId, expected } of ops) {
      const recipe: Recipe = { version: 1, steps: [{ opId }] };
      const out = await runRecipe({ registry, recipe, input });
      expect(out.output).toEqual({ type: "string", value: expected });
    }

    const keccak256 = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "hash.keccak", args: { bits: 256 } }] },
      input
    });
    expect(keccak256.output).toEqual({
      type: "string",
      value: "1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8"
    });

    const keccakFallback = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "hash.keccak", args: { bits: 123 } }] },
      input
    });
    expect(keccakFallback.output).toEqual({
      type: "string",
      value:
        "52fa80662e64c128f8389c9ea6c73d4c02368004bf4463491900d11aaadca39d47de1b01361f207c512cfa79f0f92c3395c67ff7928e3f5ce3e3c852b392f976"
    });
  });

  it("rejects invalid input types for new hash operations", async () => {
    await expect(
      crc64Checksum.run({ input: { type: "json", value: {} } as never, args: {} })
    ).rejects.toThrow("Expected bytes or string input");
    await expect(md4.run({ input: { type: "json", value: {} } as never, args: {} })).rejects.toThrow(
      "Expected bytes or string input"
    );
    await expect(
      blake3.run({ input: { type: "json", value: {} } as never, args: {} })
    ).rejects.toThrow("Expected bytes or string input");
    await expect(
      keccak.run({ input: { type: "json", value: {} } as never, args: {} })
    ).rejects.toThrow("Expected bytes or string input");
    await expect(
      whirlpool.run({ input: { type: "json", value: {} } as never, args: {} })
    ).rejects.toThrow("Expected bytes or string input");
    await expect(sm3.run({ input: { type: "json", value: {} } as never, args: {} })).rejects.toThrow(
      "Expected bytes or string input"
    );
    await expect(
      xxhash32.run({ input: { type: "json", value: {} } as never, args: {} })
    ).rejects.toThrow("Expected bytes or string input");
    await expect(
      xxhash64.run({ input: { type: "json", value: {} } as never, args: {} })
    ).rejects.toThrow("Expected bytes or string input");
    await expect(
      xxhash3.run({ input: { type: "json", value: {} } as never, args: {} })
    ).rejects.toThrow("Expected bytes or string input");
    await expect(
      xxhash128.run({ input: { type: "json", value: {} } as never, args: {} })
    ).rejects.toThrow("Expected bytes or string input");
  });

  it("computes new hashes for byte input", async () => {
    const registry = new InMemoryRegistry();
    registry.register(crc64Checksum);
    registry.register(sm3);
    registry.register(xxhash32);
    registry.register(xxhash64);
    registry.register(xxhash3);
    registry.register(xxhash128);

    const input = { type: "bytes", value: new Uint8Array([0, 1, 2, 3, 4]) } as const;
    const ops = [
      { opId: "hash.crc64", expected: "2ef6d326f445d75b" },
      {
        opId: "hash.sm3",
        expected: "96eda336eb22ee830f1d1354ce363872497171a3eac3cdf1d251c88bd4d28d2f"
      },
      { opId: "hash.xxhash32", expected: "9ea1b7c4" },
      { opId: "hash.xxhash64", expected: "dd0274386e26030c" },
      { opId: "hash.xxhash3", expected: "b075753a84ca0fbe" },
      { opId: "hash.xxhash128", expected: "9434532106a7c141c920d2347a85929b" }
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
    registry.register(hmacSha224);
    registry.register(hmacSha256);
    registry.register(hmacSha384);
    registry.register(hmacSha512);
    registry.register(hmacMd5);
    registry.register(hmacRipemd160);
    registry.register(hmacWhirlpool);

    const input = { type: "string", value: "hello" } as const;
    const ops = [
      {
        opId: "crypto.hmacSha1",
        expected: "b34ceac4516ff23a143e61d79d0fa7a4fbe5f266"
      },
      {
        opId: "crypto.hmacSha224",
        expected: "6b30a4ecbe38b6a90d7dd0ac3ef17aa68c0aa8bd5c79d2b219f4e6f6"
      },
      {
        opId: "crypto.hmacSha256",
        expected: "9307b3b915efb5171ff14d8cb55fbcc798c6c0ef1456d66ded1a6aa723a58b7b"
      },
      {
        opId: "crypto.hmacSha384",
        expected:
          "eacbad575c301fa68afb26dae48b25bf5cd42fd08ed28c08c274ce62df7928f01249976cd8aaf1ab0681d3accedc9543"
      },
      {
        opId: "crypto.hmacSha512",
        expected:
          "ff06ab36757777815c008d32c8e14a705b4e7bf310351a06a23b612dc4c7433e7757d20525a5593b71020ea2ee162d2311b247e9855862b270122419652c0c92"
      },
      {
        opId: "crypto.hmacMd5",
        expected: "04130747afca4d79e32e87cf2104f087"
      },
      {
        opId: "crypto.hmacRipemd160",
        expected: "43ab51f803a68a8b894cb32ee19e6854e9f4e468"
      },
      {
        opId: "crypto.hmacWhirlpool",
        expected:
          "4264aa55d8b7ad8db6c6fe7d09dbc5955a3221185903a1506670ab036f2cc03b8685133a52bff64c5b4d38579040d674770af88d68682ed96633bf30dfa68035"
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

  it("derives HKDF keys", async () => {
    const registry = new InMemoryRegistry();
    registry.register(hkdf);
    const recipe: Recipe = {
      version: 1,
      steps: [
        {
          opId: "crypto.hkdf",
          args: {
            salt: "salt",
            saltEncoding: "utf8",
            info: "context",
            infoEncoding: "utf8",
            length: 32,
            hash: "SHA-256"
          }
        }
      ]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "input key material" }
    });
    expect(out.output).toEqual({
      type: "string",
      value: "790773b8093544d7052c18034ec05ddbf2753a2b9a23783a868b95143f516357"
    });
  });

  it("derives scrypt keys with bounded params", async () => {
    const registry = new InMemoryRegistry();
    registry.register(scrypt);
    const recipe: Recipe = {
      version: 1,
      steps: [
        {
          opId: "crypto.scrypt",
          args: {
            salt: "salt",
            saltEncoding: "utf8",
            length: 32,
            costN: 16384,
            blockSizeR: 8,
            parallelizationP: 1,
            maxmem: 67108864
          }
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
      value: "745731af4484f323968969eda289aeee005b5903ac561e64a5aca121797bf773"
    });
  });

  it("rejects invalid scrypt cost parameters", async () => {
    const registry = new InMemoryRegistry();
    registry.register(scrypt);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "crypto.scrypt", args: { salt: "salt", costN: 12345 } }]
    };
    await expect(
      runRecipe({
        registry,
        recipe,
        input: { type: "string", value: "password" }
      })
    ).rejects.toThrow("costN must be a power of two");
  });

  it("validates bcrypt verify arguments", async () => {
    await expect(
      bcryptVerify.run({ input: { type: "string", value: "password" }, args: {} })
    ).rejects.toThrow("Hash argument is required");
    await expect(
      bcryptVerify.run({ input: { type: "json", value: {} } as never, args: { hash: "x" } })
    ).rejects.toThrow("Expected bytes or string input");
  });

  it("validates hash-wasm hmac arguments", async () => {
    await expect(
      hmacSha224.run({ input: { type: "string", value: "hello" }, args: {} })
    ).rejects.toThrow("Key argument is required");
    await expect(
      hmacMd5.run({ input: { type: "json", value: {} } as never, args: { key: "key" } })
    ).rejects.toThrow("Expected bytes or string input");
    await expect(
      hmacRipemd160.run({
        input: { type: "bytes", value: new TextEncoder().encode("hello") },
        args: { key: "a2V5", keyEncoding: "base64" }
      })
    ).resolves.toEqual({ type: "string", value: "43ab51f803a68a8b894cb32ee19e6854e9f4e468" });
    await expect(
      hmacWhirlpool.run({
        input: { type: "string", value: "hello" },
        args: { key: "6b6579", keyEncoding: "hex" }
      })
    ).resolves.toEqual({
      type: "string",
      value:
        "4264aa55d8b7ad8db6c6fe7d09dbc5955a3221185903a1506670ab036f2cc03b8685133a52bff64c5b4d38579040d674770af88d68682ed96633bf30dfa68035"
    });
  });

  it("derives argon2 hashes", async () => {
    const registry = new InMemoryRegistry();
    registry.register(argon2d);
    registry.register(argon2i);
    registry.register(argon2id);

    const encodedCases = [
      {
        opId: "crypto.argon2d",
        expected: "$argon2d$v=19$m=64,t=2,p=1$c29tZXNhbHQ$Us1acEuyS5qaT/6ahVZKIg"
      },
      {
        opId: "crypto.argon2i",
        expected: "$argon2i$v=19$m=64,t=2,p=1$c29tZXNhbHQ$uRkUb20yOYJF7x2+Gf6qbA"
      },
      {
        opId: "crypto.argon2id",
        expected: "$argon2id$v=19$m=64,t=2,p=1$c29tZXNhbHQ$CpahY97MNWo2uyGWQjji4g"
      }
    ];

    for (const { opId, expected } of encodedCases) {
      const out = await runRecipe({
        registry,
        recipe: {
          version: 1,
          steps: [
            {
              opId,
              args: { salt: "somesalt", iterations: 2, memorySize: 64, hashLength: 16 }
            }
          ]
        },
        input: { type: "string", value: "password" }
      });
      expect(out.output).toEqual({ type: "string", value: expected });
    }

    const hexOut = await runRecipe({
      registry,
      recipe: {
        version: 1,
        steps: [
          {
            opId: "crypto.argon2id",
            args: {
              salt: "736f6d6573616c74",
              saltEncoding: "hex",
              iterations: 2,
              memorySize: 64,
              hashLength: 16,
              outputType: "hex"
            }
          }
        ]
      },
      input: { type: "bytes", value: new TextEncoder().encode("password") }
    });
    expect(hexOut.output).toEqual({ type: "string", value: "0a96a163decc356a36bb21964238e2e2" });
  });

  it("verifies argon2 hashes", async () => {
    const registry = new InMemoryRegistry();
    registry.register(argon2Verify);
    const hash = "$argon2id$v=19$m=64,t=2,p=1$c29tZXNhbHQ$CpahY97MNWo2uyGWQjji4g";

    const ok = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "crypto.argon2Verify", args: { hash } }] },
      input: { type: "string", value: "password" }
    });
    expect(ok.output).toEqual({ type: "json", value: { matches: true } });

    const bad = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "crypto.argon2Verify", args: { hash } }] },
      input: { type: "bytes", value: new TextEncoder().encode("wrong") }
    });
    expect(bad.output).toEqual({ type: "json", value: { matches: false } });
  });

  it("validates argon2 arguments", async () => {
    await expect(
      argon2id.run({ input: { type: "string", value: "password" }, args: {} })
    ).rejects.toThrow("Salt argument is required");
    await expect(
      argon2i.run({
        input: { type: "string", value: "password" },
        args: { salt: "salt", iterations: 0 }
      })
    ).rejects.toThrow("Iterations must be a positive number");
    await expect(
      argon2d.run({
        input: { type: "string", value: "password" },
        args: { salt: "salt", memorySize: 4 }
      })
    ).rejects.toThrow("Memory size must be at least 8 KiB");
    await expect(
      argon2d.run({
        input: { type: "string", value: "password" },
        args: { salt: "salt", parallelism: 17 }
      })
    ).rejects.toThrow("Parallelism must not exceed 16");
    await expect(
      argon2id.run({
        input: { type: "string", value: "password" },
        args: { salt: "salt", hashLength: 1025 }
      })
    ).rejects.toThrow("Hash length must not exceed 1024 bytes");
    await expect(
      argon2Verify.run({ input: { type: "string", value: "password" }, args: {} })
    ).rejects.toThrow("Hash argument is required");
    await expect(
      argon2Verify.run({ input: { type: "json", value: {} } as never, args: { hash: "x" } })
    ).rejects.toThrow("Expected bytes or string input");
    await expect(
      argon2d.run({ input: { type: "json", value: {} } as never, args: { salt: "salt" } })
    ).rejects.toThrow("Expected bytes or string input");
    await expect(
      argon2i.run({ input: { type: "json", value: {} } as never, args: { salt: "salt" } })
    ).rejects.toThrow("Expected bytes or string input");
    await expect(
      argon2id.run({ input: { type: "json", value: {} } as never, args: { salt: "salt" } })
    ).rejects.toThrow("Expected bytes or string input");
  });
});
