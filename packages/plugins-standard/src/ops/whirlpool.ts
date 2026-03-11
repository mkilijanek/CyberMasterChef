import type { Operation } from "@cybermasterchef/core";

export const whirlpool: Operation = {
  id: "hash.whirlpool",
  name: "Whirlpool",
  description: "Computes Whirlpool digest. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: async ({ input }) => {
    const { whirlpool } = (await import("hash-wasm")) as {
      whirlpool: (data: Uint8Array) => Promise<string>;
    };
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const digest = await whirlpool(bytes);
    return { type: "string", value: digest };
  }
};
