import type { Operation } from "@cybermasterchef/core";

function decodeToken(token: string): string {
  if (!/^[0-9]+$/.test(token)) {
    throw new Error(`Invalid A1Z26 token: ${token}`);
  }
  const value = Number.parseInt(token, 10);
  if (!Number.isFinite(value) || value < 1 || value > 26) {
    throw new Error(`A1Z26 token out of range: ${token}`);
  }
  return String.fromCharCode(64 + value);
}

export const a1z26CipherDecode: Operation = {
  id: "crypto.a1z26CipherDecode",
  name: "A1Z26 Cipher Decode",
  description: "Decodes numbers to letters (A=1..Z=26).",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const tokens = input.value
      .trim()
      .split(/[\s,.-]+/)
      .map((token) => token.trim())
      .filter(Boolean);
    if (tokens.length === 0) return { type: "string", value: "" };
    const decoded = tokens.map(decodeToken).join("");
    return { type: "string", value: decoded };
  }
};
