import type { Operation } from "@cybermasterchef/core";

const BASE45_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
const BASE45_MAP = new Map(
  BASE45_ALPHABET.split("").map((char, index) => [char, index])
);

function decodeBase45(value: string): Uint8Array {
  const normalized = value.trim();
  if (!normalized) return new Uint8Array();

  const bytes: number[] = [];
  for (let i = 0; i < normalized.length;) {
    const a = BASE45_MAP.get(normalized[i] ?? "");
    const b = BASE45_MAP.get(normalized[i + 1] ?? "");
    if (a === undefined || b === undefined) {
      throw new Error("Invalid Base45 input");
    }

    if (i + 2 < normalized.length) {
      const c = BASE45_MAP.get(normalized[i + 2] ?? "");
      if (c !== undefined) {
        const value16 = a + b * 45 + c * 45 * 45;
        if (value16 > 0xffff) {
          throw new Error("Invalid Base45 triplet");
        }
        bytes.push((value16 / 256) | 0, value16 % 256);
        i += 3;
        continue;
      }
    }

    const value8 = a + b * 45;
    if (value8 > 0xff) {
      throw new Error("Invalid Base45 pair");
    }
    bytes.push(value8);
    i += 2;
  }

  return Uint8Array.from(bytes);
}

export const fromBase45: Operation = {
  id: "codec.fromBase45",
  name: "From Base45",
  description: "Decodes RFC 9285 Base45 string into bytes.",
  input: ["string"],
  output: "bytes",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "bytes", value: decodeBase45(input.value) };
  }
};
