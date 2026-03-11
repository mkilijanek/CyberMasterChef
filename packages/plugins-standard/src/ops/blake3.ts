import type { Operation } from "@cybermasterchef/core";

export const blake3: Operation = {
  id: "hash.blake3",
  name: "BLAKE3",
  description: "Computes BLAKE3 digest. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: async ({ input }) => {
    const { blake3 } = (await import("hash-wasm")) as {
      blake3: (data: Uint8Array) => Promise<string>;
    };
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const digest = await blake3(bytes);
    return { type: "string", value: digest };
  }
};
