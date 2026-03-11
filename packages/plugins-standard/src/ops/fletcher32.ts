import type { Operation } from "@cybermasterchef/core";

function fletcher32(bytes: Uint8Array): number {
  let sum1 = 0xffff;
  let sum2 = 0xffff;
  let offset = 0;
  while (offset < bytes.length) {
    const tlen = Math.min(360, bytes.length - offset);
    for (let i = 0; i < tlen; i += 2) {
      const hi = bytes[offset + i] ?? 0;
      const lo = bytes[offset + i + 1] ?? 0;
      const word = (hi << 8) | lo;
      sum1 = (sum1 + word) % 0xffff;
      sum2 = (sum2 + sum1) % 0xffff;
    }
    offset += tlen;
  }
  return (((sum2 << 16) | sum1) >>> 0);
}

export const fletcher32Checksum: Operation = {
  id: "hash.fletcher32",
  name: "Fletcher-32",
  description: "Computes Fletcher-32 checksum. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const value = fletcher32(bytes).toString(16).padStart(8, "0");
    return { type: "string", value };
  }
};
