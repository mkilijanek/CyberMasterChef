import type { Operation } from "@cybermasterchef/core";

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function modInverse(a: number, m: number): number {
  let t = 0;
  let newT = 1;
  let r = m;
  let newR = ((a % m) + m) % m;
  while (newR !== 0) {
    const quotient = Math.floor(r / newR);
    [t, newT] = [newT, t - quotient * newT];
    [r, newR] = [newR, r - quotient * newR];
  }
  if (r > 1) return -1;
  if (t < 0) t += m;
  return t;
}

function affineDecodeChar(char: string, aInv: number, b: number): string {
  const code = char.charCodeAt(0);
  if (code >= 65 && code <= 90) {
    const y = code - 65;
    return String.fromCharCode(((aInv * (y - b + 26)) % 26) + 65);
  }
  if (code >= 97 && code <= 122) {
    const y = code - 97;
    return String.fromCharCode(((aInv * (y - b + 26)) % 26) + 97);
  }
  return char;
}

export const affineCipherDecode: Operation = {
  id: "crypto.affineCipherDecode",
  name: "Affine Cipher Decode",
  description: "Decodes ASCII letters using the affine cipher inverse.",
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
    const aInv = modInverse(a, 26);
    if (aInv === -1) {
      throw new Error("Invalid affine key: no modular inverse for 'a'");
    }
    return {
      type: "string",
      value: [...input.value].map((c) => affineDecodeChar(c, aInv, b)).join("")
    };
  }
};
