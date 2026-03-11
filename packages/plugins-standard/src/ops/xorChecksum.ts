import type { Operation } from "@cybermasterchef/core";

function xorChecksum(bytes: Uint8Array): number {
  let checksum = 0;
  for (const byte of bytes) {
    checksum ^= byte;
  }
  return checksum & 0xff;
}

export const xorChecksumOp: Operation = {
  id: "hash.xorChecksum",
  name: "XOR Checksum",
  description: "Computes an XOR checksum over the input bytes. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    return {
      type: "string",
      value: xorChecksum(bytes).toString(16).padStart(2, "0")
    };
  }
};
