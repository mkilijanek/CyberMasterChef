import type { Operation } from "@cybermasterchef/core";

function chiSquare(bytes: Uint8Array): number {
  const length = bytes.length;
  if (length === 0) return 0;
  const expected = length / 256;
  const freq = new Uint32Array(256);
  for (const byte of bytes) freq[byte] = (freq[byte] ?? 0) + 1;
  let sum = 0;
  for (let i = 0; i < freq.length; i++) {
    const count = freq[i] ?? 0;
    const diff = count - expected;
    sum += (diff * diff) / expected;
  }
  return sum;
}

export const chiSquareOp: Operation = {
  id: "forensic.chiSquare",
  name: "Chi Square",
  description: "Computes chi-square statistic against uniform byte distribution.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const value = chiSquare(bytes);
    return { type: "string", value: value.toFixed(4) };
  }
};
