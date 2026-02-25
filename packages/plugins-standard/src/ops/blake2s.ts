import type { Operation } from "@cybermasterchef/core";

export const blake2s: Operation = {
  id: "hash.blake2s",
  name: "BLAKE2s",
  description: "Computes BLAKE2s digest (256-bit). Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: async ({ input }) => {
    const { blake2s } = (await import("hash-wasm")) as {
      blake2s: (data: Uint8Array, bits?: number) => Promise<string>;
    };
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const digest = await blake2s(bytes, 256);
    return { type: "string", value: digest };
  }
};
