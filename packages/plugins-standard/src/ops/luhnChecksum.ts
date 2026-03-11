import type { Operation } from "@cybermasterchef/core";

const RADIX_DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function parseRadix(rawRadix: unknown): number {
  if (rawRadix === undefined) {
    return 10;
  }
  if (typeof rawRadix !== "number" || !Number.isInteger(rawRadix) || rawRadix < 2 || rawRadix > 36) {
    throw new Error("radix must be an integer between 2 and 36");
  }
  return rawRadix;
}

function luhnChecksum(value: string, radix: number): string {
  const normalized = value.trim().toUpperCase();
  if (normalized.length === 0) {
    throw new Error("Expected a non-empty string input");
  }

  let sum = 0;
  let shouldDouble = true;
  for (let index = normalized.length - 1; index >= 0; index -= 1) {
    const digit = RADIX_DIGITS.indexOf(normalized[index]!);
    if (digit < 0 || digit >= radix) {
      throw new Error(`Input contains characters outside radix ${radix}`);
    }
    let valueToAdd = digit;
    if (shouldDouble) {
      valueToAdd *= 2;
      if (valueToAdd >= radix) {
        valueToAdd = Math.floor(valueToAdd / radix) + (valueToAdd % radix);
      }
    }
    sum += valueToAdd;
    shouldDouble = !shouldDouble;
  }

  return RADIX_DIGITS[(radix - (sum % radix)) % radix]!;
}

export const luhnChecksumOp: Operation = {
  id: "hash.luhnChecksum",
  name: "Luhn Checksum",
  description: "Computes the Luhn check digit for the given input string.",
  input: ["string"],
  output: "string",
  args: [
    {
      key: "radix",
      label: "Radix",
      type: "number",
      defaultValue: 10
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") {
      throw new Error("Expected string input");
    }
    return {
      type: "string",
      value: luhnChecksum(input.value, parseRadix(args.radix))
    };
  }
};
