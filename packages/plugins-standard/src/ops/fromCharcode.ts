import type { Operation } from "@cybermasterchef/core";

function parseTokens(raw: string): string[] {
  return raw
    .trim()
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

export const fromCharcode: Operation = {
  id: "codec.fromCharcode",
  name: "From Charcode",
  description: "Decodes character codes into bytes.",
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
      if (!token || !/^[0-9]+$/.test(token)) {
        throw new Error(`Invalid charcode token: ${token}`);
      }
      const value = Number.parseInt(token, 10);
      if (!Number.isFinite(value) || value < 0 || value > 255) {
        throw new Error(`Charcode out of range: ${token}`);
      }
      out[i] = value;
    }
    return { type: "bytes", value: out };
  }
};
