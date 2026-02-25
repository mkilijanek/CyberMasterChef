import type { Operation } from "@cybermasterchef/core";

export const blake2b: Operation = {
  id: "hash.blake2b",
  name: "BLAKE2b",
  description: "Computes BLAKE2b digest (512-bit). Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: async ({ input }) => {
    const { blake2b } = (await import("hash-wasm")) as {
      blake2b: (data: Uint8Array, bits?: number) => Promise<string>;
    };
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const digest = await blake2b(bytes, 512);
    return { type: "string", value: digest };
  }
};
