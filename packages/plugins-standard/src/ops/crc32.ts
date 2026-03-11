import type { Operation } from "@cybermasterchef/core";

export const crc32Checksum: Operation = {
  id: "hash.crc32",
  name: "CRC-32",
  description: "Computes CRC-32 checksum. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: async ({ input }) => {
    const { crc32 } = (await import("hash-wasm")) as {
      crc32: (data: Uint8Array) => Promise<string>;
    };
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const digest = await crc32(Uint8Array.from(bytes));
    return { type: "string", value: digest };
  }
};
