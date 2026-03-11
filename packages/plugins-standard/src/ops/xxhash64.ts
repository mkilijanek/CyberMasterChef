import type { Operation } from "@cybermasterchef/core";

export const xxhash64: Operation = {
  id: "hash.xxhash64",
  name: "xxHash64",
  description: "Computes xxHash64 digest. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: async ({ input }) => {
    const { xxhash64 } = (await import("hash-wasm")) as {
      xxhash64: (data: Uint8Array) => Promise<string>;
    };
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const digest = await xxhash64(bytes);
    return { type: "string", value: digest };
  }
};
