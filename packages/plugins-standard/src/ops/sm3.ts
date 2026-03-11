import type { Operation } from "@cybermasterchef/core";

export const sm3: Operation = {
  id: "hash.sm3",
  name: "SM3",
  description: "Computes SM3 digest. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: async ({ input }) => {
    const { sm3 } = (await import("hash-wasm")) as {
      sm3: (data: Uint8Array) => Promise<string>;
    };
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const digest = await sm3(bytes);
    return { type: "string", value: digest };
  }
};
