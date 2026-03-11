import type { Operation } from "@cybermasterchef/core";

function fletcher8(bytes: Uint8Array): number {
  let sum1 = 0;
  let sum2 = 0;
  for (const byte of bytes) {
    sum1 = (sum1 + byte) % 15;
    sum2 = (sum2 + sum1) % 15;
  }
  return ((sum2 << 4) | sum1) & 0xff;
}

export const fletcher8Checksum: Operation = {
  id: "hash.fletcher8",
  name: "Fletcher-8",
  description: "Computes Fletcher-8 checksum. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const value = fletcher8(bytes).toString(16).padStart(2, "0");
    return { type: "string", value };
  }
};
