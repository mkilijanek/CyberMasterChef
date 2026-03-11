import { decodeBytes, normalizeEncoding } from "./cryptoKeyUtils.js";

export type Argon2Variant = "argon2d" | "argon2i" | "argon2id";

export type Argon2Options = {
  password: string | Uint8Array;
  salt: Uint8Array;
  iterations: number;
  memorySize: number;
  parallelism: number;
  hashLength: number;
  outputType: "encoded" | "hex";
};

export function parseArgon2Input(input: { type: "bytes" | "string"; value: Uint8Array | string }): string | Uint8Array {
  return input.type === "bytes" ? input.value : input.value;
}

export function parseArgon2Options(
  input: { type: "bytes" | "string"; value: Uint8Array | string },
  args: Record<string, unknown>
): Argon2Options {
  const saltRaw = typeof args.salt === "string" ? args.salt : "";
  if (!saltRaw) throw new Error("Salt argument is required");

  const saltEncoding = normalizeEncoding(args.saltEncoding, "utf8");
  const salt = decodeBytes(saltRaw, saltEncoding);
  const iterations = readPositiveInteger(args.iterations, 3, "Iterations");
  const memorySize = readPositiveInteger(args.memorySize, 65536, "Memory size");
  const parallelism = readPositiveInteger(args.parallelism, 1, "Parallelism");
  const hashLength = readPositiveInteger(args.hashLength, 32, "Hash length");
  const outputType = args.outputType === "hex" ? "hex" : "encoded";

  if (memorySize < 8) throw new Error("Memory size must be at least 8 KiB");
  if (parallelism > 16) throw new Error("Parallelism must not exceed 16");
  if (hashLength > 1024) throw new Error("Hash length must not exceed 1024 bytes");

  return {
    password: parseArgon2Input(input),
    salt,
    iterations,
    memorySize,
    parallelism,
    hashLength,
    outputType
  };
}

function readPositiveInteger(value: unknown, fallback: number, label: string): number {
  const numeric = typeof value === "number" ? value : fallback;
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new Error(`${label} must be a positive number`);
  }
  return Math.floor(numeric);
}
