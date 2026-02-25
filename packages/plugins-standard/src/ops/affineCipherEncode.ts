import type { Operation } from "@cybermasterchef/core";

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function affineEncodeChar(char: string, a: number, b: number): string {
  const code = char.charCodeAt(0);
  if (code >= 65 && code <= 90) {
    const x = code - 65;
    return String.fromCharCode(((a * x + b) % 26) + 65);
  }
  if (code >= 97 && code <= 122) {
    const x = code - 97;
    return String.fromCharCode(((a * x + b) % 26) + 97);
  }
  return char;
}

export const affineCipherEncode: Operation = {
  id: "crypto.affineCipherEncode",
  name: "Affine Cipher Encode",
  description: "Encodes ASCII letters using the affine cipher (a*x+b mod 26).",
  input: ["string"],
  output: "string",
  args: [
    { key: "a", label: "a", type: "number", defaultValue: 5 },
    { key: "b", label: "b", type: "number", defaultValue: 8 }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const a = typeof args.a === "number" ? Math.floor(args.a) : 5;
    const b = typeof args.b === "number" ? Math.floor(args.b) : 8;
    if (gcd(a, 26) !== 1) {
      throw new Error("Invalid affine key: 'a' must be coprime with 26");
    }
    return {
      type: "string",
      value: [...input.value].map((c) => affineEncodeChar(c, a, b)).join("")
    };
  }
};
