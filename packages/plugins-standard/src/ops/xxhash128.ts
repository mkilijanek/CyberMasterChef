import type { Operation } from "@cybermasterchef/core";

export const xxhash128: Operation = {
  id: "hash.xxhash128",
  name: "xxHash128",
  description: "Computes xxHash128 digest. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: async ({ input }) => {
    const { xxhash128 } = (await import("hash-wasm")) as {
      xxhash128: (data: Uint8Array) => Promise<string>;
    };
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const digest = await xxhash128(bytes);
    return { type: "string", value: digest };
  }
};
