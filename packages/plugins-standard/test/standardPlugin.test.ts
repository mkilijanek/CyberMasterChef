import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe } from "@cybermasterchef/core";
import type { Recipe } from "@cybermasterchef/core";
import { standardPlugin } from "../src/index.js";

describe("standardPlugin", () => {
  it("registers baseline built-in operations", () => {
    const registry = new InMemoryRegistry();
    standardPlugin.register(registry);

    expect(registry.list().map((op) => op.id)).toEqual(
      expect.arrayContaining([
        "codec.fromBase64",
        "codec.fromBinary",
        "codec.fromFloat",
        "codec.fromHex",
        "codec.toBase64",
        "codec.toFloat",
        "codec.toBinary",
        "codec.toHex",
        "bytes.bitShiftLeft",
        "bytes.bitShiftRight",
        "crypto.argon2d",
        "crypto.argon2",
        "crypto.argon2Compare",
        "crypto.argon2i",
        "crypto.argon2id",
        "crypto.argon2Verify",
        "crypto.bifidCipherDecode",
        "crypto.bifidCipherEncode",
        "crypto.bcrypt",
        "crypto.bcryptCompare",
        "crypto.bcryptVerify",
        "crypto.caesarBoxCipher",
        "crypto.deriveHkdfKey",
        "crypto.derivePbkdf2Key",
        "crypto.extractHashes",
        "crypto.rc4",
        "crypto.rc4Drop",
        "crypto.hmacMd5",
        "crypto.hmac",
        "crypto.hmacRipemd160",
        "crypto.hmacSha224",
        "crypto.hmacWhirlpool",
        "crypto.railFenceCipherDecode",
        "crypto.railFenceCipherEncode",
        "network.changeIpFormat",
        "network.defangIpAddresses",
        "network.defangUrl",
        "network.extractMacAddresses",
        "network.extractIpAddresses",
        "network.extractURLs",
        "network.fangUrl",
        "network.ipv6TransitionAddresses",
        "network.parseIPv6",
        "network.parseURI",
        "network.parseTcp",
        "network.parseTlsRecord",
        "network.parseUdp",
        "network.parseUserAgent",
        "network.parseX509Certificate",
        "network.parseX509Crl",
        "network.stripHTTPHeaders",
        "network.stripIpHeader",
        "network.stripTCPHeader",
        "network.stripUDPHeader",
        "network.urlDecode",
        "network.urlEncode",
        "codec.urlDecode",
        "codec.urlEncode",
        "codec.decodeText",
        "codec.encodeText",
        "codec.hexToObjectIdentifier",
        "codec.objectIdentifierToHex",
        "codec.pemToHex",
        "forensic.analyseUUID",
        "forensic.chiSquareStatistic",
        "forensic.entropy",
        "forensic.generateUUID",
        "forensic.strings",
        "forensic.yaraRules",
        "hash.blake2b512",
        "hash.blake2s256",
        "hash.blake3",
        "hash.adler32Checksum",
        "hash.crc64",
        "hash.fletcher8Checksum",
        "hash.fletcher16Checksum",
        "hash.fletcher32Checksum",
        "hash.fletcher64Checksum",
        "hash.generateAllHashes",
        "hash.keccak",
        "hash.md4",
        "hash.md5Digest",
        "hash.ntHash",
        "hash.ripemd160Digest",
        "hash.sha0",
        "hash.sha1Digest",
        "hash.sha224Digest",
        "hash.sha256Digest",
        "hash.sha384Digest",
        "hash.sha512Digest",
        "hash.sm3",
        "hash.ripemd",
        "hash.sha2",
        "hash.sha3",
        "hash.sha256",
        "hash.whirlpool",
        "hash.xxhash128",
        "hash.xxhash3",
        "hash.xxhash32",
        "hash.xxhash64",
        "misc.alternatingCaps",
        "misc.comment",
        "math.sum",
        "misc.divide",
        "misc.escapeString",
        "misc.expandAlphabetRange",
        "misc.fromFloat",
        "misc.hammingDistance",
        "misc.multiply",
        "misc.subtract",
        "misc.sum",
        "misc.swapEndianness",
        "misc.toFloat",
        "crypto.a1z26Decode",
        "crypto.a1z26Encode",
        "crypto.affineDecode",
        "crypto.affineEncode",
        "crypto.atbash",
        "crypto.baconDecode",
        "crypto.baconEncode",
        "crypto.hmacSha1Legacy",
        "crypto.hkdfLegacy",
        "crypto.pbkdf2Legacy",
        "crypto.scryptLegacy",
        "math.divide",
        "text.alternatingCaps",
        "text.expandAlphabetRange",
        "text.escapeString",
        "text.rot13BruteForce",
        "text.rot47",
        "text.rot47BruteForce",
        "text.reverse"
      ])
    );
  });

  it("runs a simple built-in recipe", async () => {
    const registry = new InMemoryRegistry();
    standardPlugin.register(registry);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "codec.toHex" }, { opId: "codec.fromHex" }]
    };

    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "hello" }
    });

    expect(out.output.type).toBe("bytes");
    if (out.output.type !== "bytes") return;
    expect(new TextDecoder().decode(out.output.value)).toBe("hello");
  });

  it("supports URL encode/decode and reverse", async () => {
    const registry = new InMemoryRegistry();
    standardPlugin.register(registry);
    const recipe: Recipe = {
      version: 1,
      steps: [
        { opId: "codec.urlEncode" },
        { opId: "codec.urlDecode" },
        { opId: "text.reverse" }
      ]
    };

    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "ab cd" }
    });

    expect(out.output).toEqual({ type: "string", value: "dc ba" });
  });
});
