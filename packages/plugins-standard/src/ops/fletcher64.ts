import type { Operation } from "@cybermasterchef/core";

function fletcher64(bytes: Uint8Array): bigint {
  const mod = 0xffffffffn;
  let sum1 = mod;
  let sum2 = mod;
  let offset = 0;
  while (offset < bytes.length) {
    const tlen = Math.min(720, bytes.length - offset);
    for (let i = 0; i < tlen; i += 4) {
      const b0 = bytes[offset + i] ?? 0;
      const b1 = bytes[offset + i + 1] ?? 0;
      const b2 = bytes[offset + i + 2] ?? 0;
      const b3 = bytes[offset + i + 3] ?? 0;
      const word = BigInt((((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0));
      sum1 = (sum1 + word) % mod;
      sum2 = (sum2 + sum1) % mod;
    }
    offset += tlen;
  }
  return (sum2 << 32n) | sum1;
}

export const fletcher64Checksum: Operation = {
  id: "hash.fletcher64",
  name: "Fletcher-64",
  description: "Computes Fletcher-64 checksum. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const value = fletcher64(bytes).toString(16).padStart(16, "0");
    return { type: "string", value };
  }
};
