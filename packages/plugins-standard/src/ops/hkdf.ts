import type { Operation } from "@cybermasterchef/core";
import { bytesToHex } from "@cybermasterchef/core";
import { decodeBytes, normalizeEncoding } from "./cryptoKeyUtils.js";

type SupportedHash = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

async function deriveHkdf(
  inputKey: Uint8Array,
  salt: Uint8Array,
  info: Uint8Array,
  lengthBytes: number,
  hash: SupportedHash
): Promise<Uint8Array> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("WebCrypto is not available in this environment");
  }
  const ikm = Uint8Array.from(inputKey);
  const key = await subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  const bits = await subtle.deriveBits(
    {
      name: "HKDF",
      hash,
      salt: Uint8Array.from(salt),
      info: Uint8Array.from(info)
    },
    key,
    lengthBytes * 8
  );
  return new Uint8Array(bits);
}

export const hkdf: Operation = {
  id: "crypto.hkdf",
  name: "HKDF",
  description: "Derives key material using HKDF (hex output).",
  input: ["bytes", "string"],
  output: "string",
  args: [
    {
      key: "salt",
      label: "Salt",
      type: "string",
      defaultValue: ""
    },
    {
      key: "saltEncoding",
      label: "Salt Encoding",
      type: "select",
      defaultValue: "utf8",
      options: [
        { label: "UTF-8", value: "utf8" },
        { label: "Hex", value: "hex" },
        { label: "Base64", value: "base64" }
      ]
    },
    {
      key: "info",
      label: "Info",
      type: "string",
      defaultValue: ""
    },
    {
      key: "infoEncoding",
      label: "Info Encoding",
      type: "select",
      defaultValue: "utf8",
      options: [
        { label: "UTF-8", value: "utf8" },
        { label: "Hex", value: "hex" },
        { label: "Base64", value: "base64" }
      ]
    },
    {
      key: "length",
      label: "Key Length (bytes)",
      type: "number",
      defaultValue: 32
    },
    {
      key: "hash",
      label: "Hash",
      type: "select",
      defaultValue: "SHA-256",
      options: [
        { label: "SHA-1", value: "SHA-1" },
        { label: "SHA-256", value: "SHA-256" },
        { label: "SHA-384", value: "SHA-384" },
        { label: "SHA-512", value: "SHA-512" }
      ]
    }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }

    const saltRaw = typeof args.salt === "string" ? args.salt : "";
    if (!saltRaw) throw new Error("Salt argument is required");
    const infoRaw = typeof args.info === "string" ? args.info : "";

    const salt = decodeBytes(saltRaw, normalizeEncoding(args.saltEncoding, "utf8"));
    const info = decodeBytes(infoRaw, normalizeEncoding(args.infoEncoding, "utf8"));
    const lengthArg = typeof args.length === "number" ? args.length : 32;
    const length = Math.floor(lengthArg);
    if (!Number.isFinite(length) || length <= 0 || length > 1024) {
      throw new Error("Key length must be between 1 and 1024 bytes");
    }

    const hash: SupportedHash =
      args.hash === "SHA-1" ||
      args.hash === "SHA-256" ||
      args.hash === "SHA-384" ||
      args.hash === "SHA-512"
        ? args.hash
        : "SHA-256";

    const ikm = input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const out = await deriveHkdf(ikm, salt, info, length, hash);
    return { type: "string", value: bytesToHex(out) };
  }
};
