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
        "crypto.argon2i",
        "crypto.argon2id",
        "crypto.argon2Verify",
        "crypto.bifidCipherDecode",
        "crypto.bifidCipherEncode",
        "crypto.bcrypt",
        "crypto.bcryptVerify",
        "crypto.caesarBoxCipher",
        "crypto.rc4",
        "crypto.rc4Drop",
        "crypto.hmacMd5",
        "crypto.hmacRipemd160",
        "crypto.hmacSha224",
        "crypto.hmacWhirlpool",
        "crypto.railFenceCipherDecode",
        "crypto.railFenceCipherEncode",
        "network.changeIpFormat",
        "network.extractMacAddresses",
        "network.ipv6TransitionAddresses",
        "network.parseTlsRecord",
        "network.parseUserAgent",
        "network.parseX509Certificate",
        "network.parseX509Crl",
        "codec.urlDecode",
        "codec.urlEncode",
        "forensic.entropy",
        "forensic.yaraRules",
        "hash.blake3",
        "hash.crc64",
        "hash.generateAllHashes",
        "hash.keccak",
        "hash.md4",
        "hash.ntHash",
        "hash.sha0",
        "hash.sm3",
        "hash.sha2",
        "hash.sha3",
        "hash.sha256",
        "hash.whirlpool",
        "hash.xxhash128",
        "hash.xxhash3",
        "hash.xxhash32",
        "hash.xxhash64",
        "math.sum",
        "math.divide",
        "text.alternatingCaps",
        "text.expandAlphabetRange",
        "text.escapeString",
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
