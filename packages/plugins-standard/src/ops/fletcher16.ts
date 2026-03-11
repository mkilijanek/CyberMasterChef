import type { Operation } from "@cybermasterchef/core";

function fletcher16(bytes: Uint8Array): number {
  let sum1 = 0;
  let sum2 = 0;
  for (const byte of bytes) {
    sum1 = (sum1 + byte) % 255;
    sum2 = (sum2 + sum1) % 255;
  }
  return ((sum2 << 8) | sum1) & 0xffff;
}

export const fletcher16Checksum: Operation = {
  id: "hash.fletcher16",
  name: "Fletcher-16",
  description: "Computes Fletcher-16 checksum. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const value = fletcher16(bytes).toString(16).padStart(4, "0");
    return { type: "string", value };
  }
};
