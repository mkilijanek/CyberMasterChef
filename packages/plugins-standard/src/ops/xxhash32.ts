import type { Operation } from "@cybermasterchef/core";

export const xxhash32: Operation = {
  id: "hash.xxhash32",
  name: "xxHash32",
  description: "Computes xxHash32 digest. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: async ({ input }) => {
    const { xxhash32 } = (await import("hash-wasm")) as {
      xxhash32: (data: Uint8Array) => Promise<string>;
    };
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const digest = await xxhash32(bytes);
    return { type: "string", value: digest };
  }
};
