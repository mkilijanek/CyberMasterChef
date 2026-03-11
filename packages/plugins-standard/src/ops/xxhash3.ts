import type { Operation } from "@cybermasterchef/core";

export const xxhash3: Operation = {
  id: "hash.xxhash3",
  name: "xxHash3",
  description: "Computes xxHash3 digest. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: async ({ input }) => {
    const { xxhash3 } = (await import("hash-wasm")) as {
      xxhash3: (data: Uint8Array) => Promise<string>;
    };
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const digest = await xxhash3(bytes);
    return { type: "string", value: digest };
  }
};
