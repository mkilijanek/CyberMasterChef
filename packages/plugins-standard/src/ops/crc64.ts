import type { Operation } from "@cybermasterchef/core";

export const crc64Checksum: Operation = {
  id: "hash.crc64",
  name: "CRC-64",
  description: "Computes CRC-64 digest. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: async ({ input }) => {
    const { crc64 } = (await import("hash-wasm")) as {
      crc64: (data: Uint8Array) => Promise<string>;
    };
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const digest = await crc64(bytes);
    return { type: "string", value: digest };
  }
};
