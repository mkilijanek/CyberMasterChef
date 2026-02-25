import type { Operation } from "@cybermasterchef/core";
import { bytesToHex } from "@cybermasterchef/core";
import { decodeBytes, normalizeEncoding } from "./cryptoKeyUtils.js";

async function derivePbkdf2(
  password: Uint8Array,
  salt: Uint8Array,
  iterations: number,
  lengthBytes: number,
  hash: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512"
): Promise<Uint8Array> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("WebCrypto is not available in this environment");
  }
  const safePassword = Uint8Array.from(password);
  const safeSalt = Uint8Array.from(salt);
  const key = await subtle.importKey("raw", safePassword, "PBKDF2", false, ["deriveBits"]);
  const bits = await subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: safeSalt,
      iterations,
      hash
    },
    key,
    lengthBytes * 8
  );
  return new Uint8Array(bits);
}

export const pbkdf2: Operation = {
  id: "crypto.pbkdf2",
  name: "PBKDF2",
  description: "Derives key material using PBKDF2 (hex output).",
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
      key: "iterations",
      label: "Iterations",
      type: "number",
      defaultValue: 10000
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

    const saltEncoding = normalizeEncoding(args.saltEncoding, "utf8");
    const salt = decodeBytes(saltRaw, saltEncoding);
    const iterations = typeof args.iterations === "number" ? args.iterations : 10000;
    const length = typeof args.length === "number" ? args.length : 32;
    const hash =
      args.hash === "SHA-1" ||
      args.hash === "SHA-256" ||
      args.hash === "SHA-384" ||
      args.hash === "SHA-512"
        ? args.hash
        : "SHA-256";

    if (!Number.isFinite(iterations) || iterations <= 0) {
      throw new Error("Iterations must be a positive number");
    }
    if (!Number.isFinite(length) || length <= 0) {
      throw new Error("Key length must be a positive number");
    }

    const password =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const derived = await derivePbkdf2(password, salt, Math.floor(iterations), Math.floor(length), hash);
    return { type: "string", value: bytesToHex(derived) };
  }
};
