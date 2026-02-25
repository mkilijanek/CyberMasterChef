import type { Operation } from "@cybermasterchef/core";

function parseTokens(raw: string): string[] {
  return raw
    .trim()
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

export const fromOctal: Operation = {
  id: "codec.fromOctal",
  name: "From Octal",
  description: "Decodes octal byte values into bytes.",
  input: ["string"],
  output: "bytes",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const tokens = parseTokens(input.value);
    if (tokens.length === 0) return { type: "bytes", value: new Uint8Array() };

    const out = new Uint8Array(tokens.length);
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (!token || !/^[0-7]+$/.test(token)) {
        throw new Error(`Invalid octal token: ${token}`);
      }
      const value = Number.parseInt(token, 8);
      if (!Number.isFinite(value) || value < 0 || value > 255) {
        throw new Error(`Octal byte out of range: ${token}`);
      }
      out[i] = value;
    }
    return { type: "bytes", value: out };
  }
};
