import { describe, expect, it } from "vitest";
import { InMemoryRegistry, bytesToHex, runRecipe, type Recipe } from "@cybermasterchef/core";
import { adler32Checksum } from "../src/ops/adler32.js";
import { crc32Checksum } from "../src/ops/crc32.js";
import { crc64Checksum } from "../src/ops/crc64.js";
import { fletcher8Checksum } from "../src/ops/fletcher8.js";
import { fletcher16Checksum } from "../src/ops/fletcher16.js";
import { fletcher32Checksum } from "../src/ops/fletcher32.js";
import { fletcher64Checksum } from "../src/ops/fletcher64.js";
import { xorChecksumOp } from "../src/ops/xorChecksum.js";
import { tcpIpChecksumOp } from "../src/ops/tcpIpChecksum.js";
import { luhnChecksumOp } from "../src/ops/luhnChecksum.js";
import { murmurHash3Op } from "../src/ops/murmurHash3.js";
import { generateAllChecksumsOp } from "../src/ops/generateAllChecksums.js";
import { generateAllHashesOp } from "../src/ops/generateAllHashes.js";
import { analyseHash } from "../src/ops/analyseHash.js";
import { atbashCipher } from "../src/ops/atbashCipher.js";
import { affineCipherEncode } from "../src/ops/affineCipherEncode.js";
import { affineCipherDecode } from "../src/ops/affineCipherDecode.js";
import { a1z26CipherEncode } from "../src/ops/a1z26CipherEncode.js";
import { a1z26CipherDecode } from "../src/ops/a1z26CipherDecode.js";
import { baconCipherEncode } from "../src/ops/baconCipherEncode.js";
import { baconCipherDecode } from "../src/ops/baconCipherDecode.js";
import { caesarBoxCipher } from "../src/ops/caesarBoxCipher.js";
import { railFenceCipherEncode } from "../src/ops/railFenceCipherEncode.js";
import { railFenceCipherDecode } from "../src/ops/railFenceCipherDecode.js";
import { rc4 } from "../src/ops/rc4.js";
import { rc4Drop } from "../src/ops/rc4Drop.js";
import { normalizeRc4Drop, normalizeRc4Key, rc4Transform } from "../src/ops/rc4Utils.js";
import { bifidCipherEncode } from "../src/ops/bifidCipherEncode.js";
import { bifidCipherDecode } from "../src/ops/bifidCipherDecode.js";
import { createPolybiusSquare, bifidEncodeText, bifidDecodeText } from "../src/ops/polybiusUtils.js";
import { bcrypt } from "../src/ops/bcrypt.js";
import { bcryptParse } from "../src/ops/bcryptParse.js";
import { bcryptVerify } from "../src/ops/bcryptVerify.js";
import { hashMd5 } from "../src/ops/hashMd5.js";
import { md4 } from "../src/ops/md4.js";
import { ntHash, toUtf16LeBytes } from "../src/ops/ntHash.js";
import { ripemd160 } from "../src/ops/ripemd160.js";
import { sha1 } from "../src/ops/sha1.js";
import { sha0, sha0Digest } from "../src/ops/sha0.js";
import { sha2 } from "../src/ops/sha2.js";
import { sha224 } from "../src/ops/sha224.js";
import { sha384 } from "../src/ops/sha384.js";
import { sha512 } from "../src/ops/sha512.js";
import { sha3 } from "../src/ops/sha3.js";
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

  it("computes XOR and TCP/IP checksums", async () => {
    const registry = new InMemoryRegistry();
    registry.register(xorChecksumOp);
    registry.register(tcpIpChecksumOp);

    const xorOut = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "hash.xorChecksum" }] },
      input: { type: "string", value: "abc" }
    });
    expect(xorOut.output).toEqual({ type: "string", value: "60" });

    const tcpOut = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "hash.tcpIpChecksum" }] },
      input: { type: "bytes", value: Uint8Array.from([0x61, 0x62, 0x63]) }
    });
    expect(tcpOut.output).toEqual({ type: "string", value: "3b9d" });

    const tcpStringOut = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "hash.tcpIpChecksum" }] },
      input: { type: "string", value: "abc" }
    });
    expect(tcpStringOut.output).toEqual({ type: "string", value: "3b9d" });
  });

  it("computes Luhn checksum digits across radices", async () => {
    const registry = new InMemoryRegistry();
    registry.register(luhnChecksumOp);

    const decimal = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "hash.luhnChecksum" }] },
      input: { type: "string", value: "7992739871" }
    });
    expect(decimal.output).toEqual({ type: "string", value: "3" });

    const hexadecimal = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "hash.luhnChecksum", args: { radix: 16 } }] },
      input: { type: "string", value: "A1" }
    });
    expect(hexadecimal.output).toEqual({ type: "string", value: "4" });
  });

  it("computes MurmurHash3 and aggregate checksums", async () => {
    const registry = new InMemoryRegistry();
    registry.register(murmurHash3Op);
    registry.register(generateAllChecksumsOp);

    const murmur = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "hash.murmurHash3" }] },
      input: { type: "string", value: "hello" }
    });
    expect(murmur.output).toEqual({ type: "string", value: "248bfa47" });

    const murmurTail3 = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "hash.murmurHash3" }] },
      input: { type: "string", value: "abc" }
    });
    expect(murmurTail3.output).toEqual({ type: "string", value: "b3dd93fa" });

    const aggregate = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "hash.generateAllChecksums" }] },
      input: { type: "string", value: "abc" }
    });
    expect(aggregate.output.type).toBe("json");
    if (aggregate.output.type !== "json") return;
    expect(aggregate.output.value).toMatchObject({
      adler32: "024d0127",
      crc32: "352441c2",
      crc64: "2cd8094a1a277627",
      fletcher16: "4c27",
      xorChecksum: "60",
      tcpIpChecksum: "3b9d",
      md5: "900150983cd24fb0d6963f7d28e17f72",
      sha1: "a9993e364706816aba3e25717850c26c9cd0d89d",
      sha256: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    });
  });

  it("computes aggregate hashes", async () => {
    const registry = new InMemoryRegistry();
    registry.register(generateAllHashesOp);

    const aggregate = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "hash.generateAllHashes" }] },
      input: { type: "string", value: "abc" }
    });
    expect(aggregate.output.type).toBe("json");
    if (aggregate.output.type !== "json") return;
    expect(aggregate.output.value).toMatchObject({
      md4: "a448017aaf21d8525fc10ae87aa6729d",
      md5: "900150983cd24fb0d6963f7d28e17f72",
      ripemd160: "8eb208f7e05d987a9b044a8e98c6b087f15a0bfc",
      sha1: "a9993e364706816aba3e25717850c26c9cd0d89d",
      sha224: "23097d223405d8228642a477bda255b32aadbce4bda0b3f7e36c9da7",
      sha256: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
      sha384:
        "cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7",
      sha512:
        "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f",
      sha3_256: "3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532",
      sha3_512:
        "b751850b1a57168a5693cd924b6b096e08f621827444f70d884f5d0240d2712e10e116e9192af3c91a7ec57647e3934057340b4cf408d5a56592f8274eec53f0",
      blake2b:
        "ba80a53f981c4d0d6a2797b69f12f6e94c212f14685ac4b74b12bb6fdbffa2d17d87c5392aab792dc252d5de4533cc9518d38aa8dbf1925ab92386edd4009923",
      blake2s: "508c5e8c327c14e2e1a72ba34eeb452f37458b209ed63a294d999b4c86675982",
      blake3: "6437b3ac38465133ffb63b75273a8db548c558465d79db03fd359c6cd5bd9d85",
      sm3: "66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0",
      whirlpool:
        "4e2448a4c6f486bb16b6562c73b4020bf3043e3a731bce721ae1b303d97e6d4c7181eebdb6c57e277d0e34957114cbd6c797fc9d95d8b582d225292076d4eef5"
    });
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

  it("applies Caesar box cipher", async () => {
    const registry = new InMemoryRegistry();
    registry.register(caesarBoxCipher);
    const out = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "crypto.caesarBoxCipher", args: { size: 4 } }] },
      input: { type: "string", value: "WEAREDISCOVERED" }
    });
    expect(out.output).toEqual({ type: "string", value: "WECREDOEAIVDRSEX" });

    const defaultSize = await caesarBoxCipher.run({
      input: { type: "string", value: "ABCD" },
      args: { size: "2" }
    });
    expect(defaultSize).toEqual({ type: "string", value: "ACBD" });

    const empty = await caesarBoxCipher.run({
      input: { type: "string", value: "" },
      args: {}
    });
    expect(empty).toEqual({ type: "string", value: "" });
  });

  it("encodes and decodes rail fence cipher", async () => {
    const registry = new InMemoryRegistry();
    registry.register(railFenceCipherEncode);
    registry.register(railFenceCipherDecode);
    const encoded = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "crypto.railFenceCipherEncode", args: { rails: 3 } }] },
      input: { type: "string", value: "WEAREDISCOVEREDFLEEATONCE" }
    });
    expect(encoded.output).toEqual({ type: "string", value: "WECRLTEERDSOEEFEAOCAIVDEN" });

    const decoded = await runRecipe({
      registry,
      recipe: {
        version: 1,
        steps: [{ opId: "crypto.railFenceCipherDecode", args: { rails: "3" } }]
      },
      input: { type: "string", value: "WECRLTEERDSOEEFEAOCAIVDEN" }
    });
    expect(decoded.output).toEqual({ type: "string", value: "WEAREDISCOVEREDFLEEATONCE" });

    const single = await railFenceCipherEncode.run({
      input: { type: "string", value: "A" },
      args: { rails: 3 }
    });
    expect(single).toEqual({ type: "string", value: "A" });

    const directStringRail = await railFenceCipherEncode.run({
      input: { type: "string", value: "HELLO" },
      args: { rails: "3" }
    });
    expect(directStringRail).toEqual({ type: "string", value: "HOELL" });

    const defaultRailsFromBlank = await railFenceCipherEncode.run({
      input: { type: "string", value: "HELLO" },
      args: { rails: " " }
    });
    expect(defaultRailsFromBlank).toEqual({ type: "string", value: "HOELL" });

    const singleDecoded = await railFenceCipherDecode.run({
      input: { type: "string", value: "A" },
      args: { rails: 3 }
    });
    expect(singleDecoded).toEqual({ type: "string", value: "A" });
  });

  it("encodes and decodes bifid cipher", async () => {
    const registry = new InMemoryRegistry();
    registry.register(bifidCipherEncode);
    registry.register(bifidCipherDecode);

    const encoded = await runRecipe({
      registry,
      recipe: {
        version: 1,
        steps: [{ opId: "crypto.bifidCipherEncode", args: { keyword: "", period: 5 } }]
      },
      input: { type: "string", value: "FLEEATONCE" }
    });
    expect(encoded.output).toEqual({ type: "string", value: "HAAEVSLDSP" });

    const decoded = await runRecipe({
      registry,
      recipe: {
        version: 1,
        steps: [{ opId: "crypto.bifidCipherDecode", args: { keyword: "", period: 5 } }]
      },
      input: { type: "string", value: "HAAEVSLDSP" }
    });
    expect(decoded.output).toEqual({ type: "string", value: "FLEEATONCE" });

    const normalizedJ = await bifidCipherEncode.run({
      input: { type: "string", value: "JIG" },
      args: { keyword: "", period: "5" }
    });
    expect(normalizedJ).toEqual({ type: "string", value: "GIR" });

    expect(createPolybiusSquare("JIGGLE")).toEqual([
      "I",
      "G",
      "L",
      "E",
      "A",
      "B",
      "C",
      "D",
      "F",
      "H",
      "K",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z"
    ]);
    expect(createPolybiusSquare(42)).toHaveLength(25);
    expect(bifidEncodeText("123", "", 5)).toBe("");
    expect(bifidDecodeText("", "", 5)).toBe("");
    expect(bifidEncodeText("FLEEATONCE", "", " ")).toBe("HAAEVSLDSP");
    expect(bifidDecodeText("HAAEVSLDSP", "", "5")).toBe("FLEEATONCE");
    expect(bifidDecodeText("HAAEVSLDSP", "", " ")).toBe("FLEEATONCE");
    expect(() => bifidDecodeText("ABC", "", "1")).toThrow(
      "Period must be an integer greater than or equal to 2"
    );
  });

  it("computes SHA0 and NT hash", async () => {
    expect(bytesToHex(sha0Digest(new TextEncoder().encode("abc")))).toBe(
      "0164b8a914cd2a5e74c4f7ff082c4d97f1edf880"
    );

    const sha0Out = await sha0.run({
      input: { type: "string", value: "abc" },
      args: {}
    });
    expect(sha0Out).toEqual({
      type: "string",
      value: "0164b8a914cd2a5e74c4f7ff082c4d97f1edf880"
    });

    expect(Array.from(toUtf16LeBytes("AĄ"))).toEqual([0x41, 0x00, 0x04, 0x01]);

    const ntHashOut = await ntHash.run({
      input: { type: "string", value: "password" },
      args: {}
    });
    expect(ntHashOut).toEqual({
      type: "string",
      value: "8846f7eaee8fb117ad06bdd830b7586c"
    });
  });

  it("applies RC4 and RC4-drop transforms", async () => {
    const plaintext = new TextEncoder().encode("Plaintext");
    const key = normalizeRc4Key("Key");
    expect(normalizeRc4Drop(undefined)).toBe(0);
    expect(normalizeRc4Drop(" ")).toBe(0);
    expect(normalizeRc4Drop("256")).toBe(256);

    const transformed = rc4Transform(plaintext, key);
    expect(bytesToHex(transformed)).toBe("bbf316e8d940af0ad3");

    const registry = new InMemoryRegistry();
    registry.register(rc4);
    registry.register(rc4Drop);

    const encrypted = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "crypto.rc4", args: { passphrase: "Key" } }] },
      input: { type: "string", value: "Plaintext" }
    });
    expect(encrypted.output.type).toBe("bytes");
    if (encrypted.output.type !== "bytes") return;
    expect(bytesToHex(encrypted.output.value)).toBe("bbf316e8d940af0ad3");

    const decrypted = await rc4.run({
      input: encrypted.output,
      args: { passphrase: "Key" }
    });
    expect(decrypted.type).toBe("bytes");
    if (decrypted.type !== "bytes") return;
    expect(new TextDecoder().decode(decrypted.value)).toBe("Plaintext");

    const dropped = await rc4Drop.run({
      input: { type: "string", value: "Plaintext" },
      args: { passphrase: "Key", drop: "256" }
    });
    expect(dropped.type).toBe("bytes");
    if (dropped.type !== "bytes") return;
    expect(bytesToHex(dropped.value)).toBe(bytesToHex(rc4Transform(plaintext, key, 256)));

    const zeroDrop = await rc4Drop.run({
      input: { type: "bytes", value: plaintext },
      args: { passphrase: "Key", drop: 0 }
    });
    expect(zeroDrop.type).toBe("bytes");
    if (zeroDrop.type !== "bytes") return;
    expect(bytesToHex(zeroDrop.value)).toBe("bbf316e8d940af0ad3");
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

  it("hashes input with bcrypt", async () => {
    const registry = new InMemoryRegistry();
    registry.register(bcrypt);

    const hashed = await runRecipe({
      registry,
      recipe: {
        version: 1,
        steps: [
          {
            opId: "crypto.bcrypt",
            args: { rounds: 4, salt: "0123456789abcdef", saltEncoding: "utf8" }
          }
        ]
      },
      input: { type: "string", value: "password" }
    });
    expect(hashed.output.type).toBe("string");
    if (hashed.output.type !== "string") return;
    expect(hashed.output.value).toBe(
      "$2a$04$KBCwKxOzLha2MUDgW0PjXehyC7kcbJmICs4eWpZZOlh/QJzfSPPHe"
    );

    registry.register(bcryptVerify);
    const verified = await runRecipe({
      registry,
      recipe: {
        version: 1,
        steps: [{ opId: "crypto.bcryptVerify", args: { hash: hashed.output.value } }]
      },
      input: { type: "string", value: "password" }
    });
    expect(verified.output).toEqual({ type: "json", value: { matches: true } });

    const bytesWithHexSalt = await bcrypt.run({
      input: { type: "bytes", value: new TextEncoder().encode("password") },
      args: {
        rounds: "4",
        salt: "30313233343536373839616263646566",
        saltEncoding: "hex"
      }
    });
    expect(bytesWithHexSalt).toEqual({
      type: "string",
      value: "$2a$04$KBCwKxOzLha2MUDgW0PjXehyC7kcbJmICs4eWpZZOlh/QJzfSPPHe"
    });

    const defaultRounds = await bcrypt.run({
      input: { type: "string", value: "password" },
      args: { salt: "0123456789abcdef", saltEncoding: "utf8" }
    });
    expect(defaultRounds.type).toBe("string");
    if (defaultRounds.type !== "string") return;
    expect(defaultRounds.value).toMatch(/^\$2a\$10\$/);
  });

  it("computes common hashes", async () => {
    const registry = new InMemoryRegistry();
    registry.register(hashMd5);
    registry.register(md4);
    registry.register(ripemd160);
    registry.register(sha1);
    registry.register(sha2);
    registry.register(sha224);
    registry.register(sha384);
    registry.register(sha512);
    registry.register(sha3);
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

    const sha2_224 = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "hash.sha2", args: { bits: 224 } }] },
      input
    });
    expect(sha2_224.output).toEqual({
      type: "string",
      value: "ea09ae9cc6768c50fcee903ed054556e5bfc8347907f12598aa24193"
    });

    const sha2_fallback = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "hash.sha2", args: { bits: 123 } }] },
      input
    });
    expect(sha2_fallback.output).toEqual({
      type: "string",
      value: "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
    });

    const sha2_384 = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "hash.sha2", args: { bits: 384 } }] },
      input
    });
    expect(sha2_384.output).toEqual({
      type: "string",
      value:
        "59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f"
    });

    const sha2_512 = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "hash.sha2", args: { bits: "512" } }] },
      input
    });
    expect(sha2_512.output).toEqual({
      type: "string",
      value:
        "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043"
    });

    const sha3_224 = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "hash.sha3", args: { bits: 224 } }] },
      input
    });
    expect(sha3_224.output).toEqual({
      type: "string",
      value: "b87f88c72702fff1748e58b87e9141a42c0dbedc29a78cb0d4a5cd81"
    });

    const sha3_fallback = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "hash.sha3", args: { bits: 123 } }] },
      input
    });
    expect(sha3_fallback.output).toEqual({
      type: "string",
      value:
        "75d527c368f2efe848ecf6b073a36767800805e9eef2b1857d5f984f036eb6df891d75f72d9b154518c1cd58835286d1da9a38deba3de98b5a53e5ed78a84976"
    });
  });

  it("rejects invalid input types for new hash operations", async () => {
    expect(() =>
      xorChecksumOp.run({ input: { type: "json", value: {} } as never, args: {} })
    ).toThrow("Expected bytes or string input");
    expect(() =>
      tcpIpChecksumOp.run({ input: { type: "json", value: {} } as never, args: {} })
    ).toThrow("Expected bytes or string input");
    expect(() =>
      luhnChecksumOp.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })
    ).toThrow("Expected string input");
    expect(() =>
      luhnChecksumOp.run({ input: { type: "string", value: "" }, args: {} })
    ).toThrow("Expected a non-empty string input");
    expect(() =>
      luhnChecksumOp.run({ input: { type: "string", value: "A1" }, args: { radix: 1 } })
    ).toThrow("radix must be an integer between 2 and 36");
    expect(() =>
      luhnChecksumOp.run({ input: { type: "string", value: "G" }, args: { radix: 16 } })
    ).toThrow("Input contains characters outside radix 16");
    expect(() =>
      murmurHash3Op.run({ input: { type: "json", value: {} } as never, args: {} })
    ).toThrow("Expected bytes or string input");
    await expect(
      generateAllChecksumsOp.run({ input: { type: "json", value: {} } as never, args: {} })
    ).rejects.toThrow("Expected bytes or string input");
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
    await expect(
      generateAllHashesOp.run({ input: { type: "json", value: {} } as never, args: {} })
    ).rejects.toThrow("Expected bytes or string input");
    await expect(
      bcrypt.run({ input: { type: "json", value: {} } as never, args: {} })
    ).rejects.toThrow("Expected bytes or string input");
    await expect(
      bcrypt.run({
        input: { type: "string", value: "abc" },
        args: { rounds: 3, salt: "0123456789abcdef", saltEncoding: "utf8" }
      })
    ).rejects.toThrow("Rounds must be an integer between 4 and 31");
    await expect(
      bcrypt.run({
        input: { type: "string", value: "abc" },
        args: { rounds: 4, salt: "", saltEncoding: "utf8" }
      })
    ).rejects.toThrow("Salt argument is required");
    await expect(
      bcrypt.run({
        input: { type: "string", value: "abc" },
        args: { rounds: 4, salt: "short", saltEncoding: "utf8" }
      })
    ).rejects.toThrow("Salt must decode to exactly 16 bytes");
    await expect(
      bcrypt.run({
        input: { type: "string", value: "abc" },
        args: { rounds: 4, salt: 123, saltEncoding: "utf8" } as never
      })
    ).rejects.toThrow("Salt argument is required");
    await expect(
      sha2.run({ input: { type: "json", value: {} } as never, args: {} })
    ).rejects.toThrow("Expected bytes or string input");
    expect(() => sha0.run({ input: { type: "json", value: {} } as never, args: {} })).toThrow(
      "Expected bytes or string input"
    );
    await expect(
      sha3.run({ input: { type: "json", value: {} } as never, args: {} })
    ).rejects.toThrow("Expected bytes or string input");
    await expect(
      ntHash.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })
    ).rejects.toThrow("Expected string input");
    expect(() =>
      caesarBoxCipher.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })
    ).toThrow("Expected string input");
    expect(() =>
      caesarBoxCipher.run({ input: { type: "string", value: "abc" }, args: { size: 1 } })
    ).toThrow("Size must be an integer greater than or equal to 2");
    expect(() =>
      railFenceCipherEncode.run({
        input: { type: "string", value: "abc" },
        args: { rails: 1 }
      })
    ).toThrow("Rails must be an integer greater than or equal to 2");
    expect(() =>
      railFenceCipherEncode.run({
        input: { type: "bytes", value: new Uint8Array() } as never,
        args: { rails: 3 }
      })
    ).toThrow("Expected string input");
    expect(() =>
      railFenceCipherDecode.run({
        input: { type: "bytes", value: new Uint8Array() } as never,
        args: { rails: 3 }
      })
    ).toThrow("Expected string input");
    expect(() =>
      bifidCipherEncode.run({
        input: { type: "bytes", value: new Uint8Array() } as never,
        args: { keyword: "", period: 5 }
      })
    ).toThrow("Expected string input");
    expect(() =>
      bifidCipherEncode.run({
        input: { type: "string", value: "abc" },
        args: { keyword: "J", period: 1 }
      })
    ).toThrow("Period must be an integer greater than or equal to 2");
    expect(() =>
      bifidCipherDecode.run({
        input: { type: "bytes", value: new Uint8Array() } as never,
        args: { keyword: "", period: 5 }
      })
    ).toThrow("Expected string input");
    expect(() => normalizeRc4Key("")).toThrow("Passphrase must be a non-empty string");
    expect(() => normalizeRc4Drop(-1)).toThrow("Drop must be a non-negative integer");
    expect(() =>
      rc4.run({
        input: { type: "string", value: "abc" },
        args: { passphrase: "" }
      })
    ).toThrow("Passphrase must be a non-empty string");
    expect(() =>
      rc4Drop.run({
        input: { type: "string", value: "abc" },
        args: { passphrase: "key", drop: -1 }
      })
    ).toThrow("Drop must be a non-negative integer");
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
