import type { Operation } from "@cybermasterchef/core";

export const md4: Operation = {
  id: "hash.md4",
  name: "MD4",
  description: "Computes MD4 digest. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: async ({ input }) => {
    const { md4 } = (await import("hash-wasm")) as {
      md4: (data: Uint8Array) => Promise<string>;
    };
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const digest = await md4(bytes);
    return { type: "string", value: digest };
  }
};
