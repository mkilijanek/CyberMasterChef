import type { Operation } from "@cybermasterchef/core";

const MOD_ADLER = 65521;

function adler32(bytes: Uint8Array): number {
  let a = 1;
  let b = 0;
  for (const byte of bytes) {
    a = (a + byte) % MOD_ADLER;
    b = (b + a) % MOD_ADLER;
  }
  return ((b << 16) | a) >>> 0;
}

export const adler32Checksum: Operation = {
  id: "hash.adler32",
  name: "Adler-32",
  description: "Computes Adler-32 checksum. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const value = adler32(bytes).toString(16).padStart(8, "0");
    return { type: "string", value };
  }
};
