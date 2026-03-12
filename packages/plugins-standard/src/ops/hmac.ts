import type { Operation } from "@cybermasterchef/core";
import { computeHashWasmHmac } from "./hmacHashWasmUtils.js";
import { bytesToHex } from "@cybermasterchef/core";
import { decodeBytes, normalizeEncoding } from "./cryptoKeyUtils.js";

type WebCryptoHash = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

async function signWebCryptoHmac(
  input: { type: string; value: unknown },
  args: Record<string, unknown>,
  hash: WebCryptoHash
): Promise<string> {
  if (input.type !== "bytes" && input.type !== "string") {
    throw new Error("Expected bytes or string input");
  }

  const keyRaw = typeof args.key === "string" ? args.key : "";
  if (!keyRaw) throw new Error("Key argument is required");

  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("WebCrypto is not available in this environment");
  }

  const encoding = normalizeEncoding(args.keyEncoding, "utf8");
  const keyBytes = decodeBytes(keyRaw, encoding);
  const safeKey = new Uint8Array(keyBytes);
  const data =
    input.type === "bytes"
      ? new Uint8Array(input.value as Uint8Array)
      : new TextEncoder().encode(input.value as string);
  const cryptoKey = await subtle.importKey("raw", safeKey, { name: "HMAC", hash }, false, ["sign"]);
  const signature = await subtle.sign("HMAC", cryptoKey, data);
  return bytesToHex(new Uint8Array(signature));
}

export const hmac: Operation = {
  id: "crypto.hmac",
  name: "HMAC",
  description: "Computes HMAC for input data and a provided key.",
  input: ["bytes", "string"],
  output: "string",
  args: [
    { key: "key", label: "Key", type: "string", defaultValue: "" },
    {
      key: "keyEncoding",
      label: "Key Encoding",
      type: "select",
      defaultValue: "utf8",
      options: [
        { label: "UTF-8", value: "utf8" },
        { label: "Hex", value: "hex" },
        { label: "Base64", value: "base64" }
      ]
    },
    {
      key: "hash",
      label: "Hash",
      type: "select",
      defaultValue: "SHA-256",
      options: [
        { label: "SHA-1", value: "SHA-1" },
        { label: "SHA-224", value: "SHA-224" },
        { label: "SHA-256", value: "SHA-256" },
        { label: "SHA-384", value: "SHA-384" },
        { label: "SHA-512", value: "SHA-512" },
        { label: "MD5", value: "MD5" },
        { label: "RIPEMD-160", value: "RIPEMD-160" },
        { label: "Whirlpool", value: "Whirlpool" }
      ]
    }
  ],
  run: async ({ input, args }) => {
    const hash = typeof args.hash === "string" ? args.hash : "SHA-256";
    switch (hash) {
      case "SHA-1":
      case "SHA-256":
      case "SHA-384":
      case "SHA-512":
        return { type: "string", value: await signWebCryptoHmac(input, args, hash) };
      case "SHA-224": {
        const { createSHA224 } = (await import("hash-wasm")) as {
          createSHA224: () => Promise<{ init: () => void; update: (input: Uint8Array | string) => void; digest: (encoding: "hex") => string }>;
        };
        return { type: "string", value: await computeHashWasmHmac(input, args, createSHA224) };
      }
      case "MD5": {
        const { createMD5 } = (await import("hash-wasm")) as {
          createMD5: () => Promise<{ init: () => void; update: (input: Uint8Array | string) => void; digest: (encoding: "hex") => string }>;
        };
        return { type: "string", value: await computeHashWasmHmac(input, args, createMD5) };
      }
      case "RIPEMD-160": {
        const { createRIPEMD160 } = (await import("hash-wasm")) as {
          createRIPEMD160: () => Promise<{ init: () => void; update: (input: Uint8Array | string) => void; digest: (encoding: "hex") => string }>;
        };
        return { type: "string", value: await computeHashWasmHmac(input, args, createRIPEMD160) };
      }
      case "Whirlpool": {
        const { createWhirlpool } = (await import("hash-wasm")) as {
          createWhirlpool: () => Promise<{ init: () => void; update: (input: Uint8Array | string) => void; digest: (encoding: "hex") => string }>;
        };
        return { type: "string", value: await computeHashWasmHmac(input, args, createWhirlpool) };
      }
      default:
        throw new Error("Unsupported HMAC hash");
    }
  }
};
