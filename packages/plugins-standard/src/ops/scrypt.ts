import type { Operation } from "@cybermasterchef/core";
import { bytesToHex } from "@cybermasterchef/core";
import { decodeBytes, normalizeEncoding } from "./cryptoKeyUtils.js";

function isPowerOfTwo(value: number): boolean {
  return value > 1 && (value & (value - 1)) === 0;
}

export const scrypt: Operation = {
  id: "crypto.scrypt",
  name: "scrypt",
  description: "Derives key material using scrypt (hex output).",
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
      key: "length",
      label: "Key Length (bytes)",
      type: "number",
      defaultValue: 32
    },
    {
      key: "costN",
      label: "Cost (N)",
      type: "number",
      defaultValue: 16384
    },
    {
      key: "blockSizeR",
      label: "Block Size (r)",
      type: "number",
      defaultValue: 8
    },
    {
      key: "parallelizationP",
      label: "Parallelization (p)",
      type: "number",
      defaultValue: 1
    },
    {
      key: "maxmem",
      label: "Max Memory (bytes)",
      type: "number",
      defaultValue: 67108864
    }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const saltRaw = typeof args.salt === "string" ? args.salt : "";
    if (!saltRaw) throw new Error("Salt argument is required");

    const length = Math.floor(typeof args.length === "number" ? args.length : 32);
    const costN = Math.floor(typeof args.costN === "number" ? args.costN : 16384);
    const blockSizeR = Math.floor(typeof args.blockSizeR === "number" ? args.blockSizeR : 8);
    const parallelizationP = Math.floor(
      typeof args.parallelizationP === "number" ? args.parallelizationP : 1
    );
    const maxmem = Math.floor(typeof args.maxmem === "number" ? args.maxmem : 64 * 1024 * 1024);

    if (!Number.isFinite(length) || length <= 0 || length > 1024) {
      throw new Error("Key length must be between 1 and 1024 bytes");
    }
    if (!Number.isFinite(costN) || !isPowerOfTwo(costN) || costN > 1 << 20) {
      throw new Error("costN must be a power of two between 2 and 1048576");
    }
    if (!Number.isFinite(blockSizeR) || blockSizeR <= 0 || blockSizeR > 32) {
      throw new Error("blockSizeR must be between 1 and 32");
    }
    if (!Number.isFinite(parallelizationP) || parallelizationP <= 0 || parallelizationP > 16) {
      throw new Error("parallelizationP must be between 1 and 16");
    }
    if (!Number.isFinite(maxmem) || maxmem < 16 * 1024 * 1024 || maxmem > 1024 * 1024 * 1024) {
      throw new Error("maxmem must be between 16777216 and 1073741824");
    }

    const { scryptSync } = await import("node:crypto");
    const password = input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const salt = decodeBytes(saltRaw, normalizeEncoding(args.saltEncoding, "utf8"));
    const out = scryptSync(Uint8Array.from(password), Uint8Array.from(salt), length, {
      N: costN,
      r: blockSizeR,
      p: parallelizationP,
      maxmem
    });
    return { type: "string", value: bytesToHex(Uint8Array.from(out)) };
  }
};
