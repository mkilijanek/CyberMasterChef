import type { Operation } from "@cybermasterchef/core";

export const ripemd160: Operation = {
  id: "hash.ripemd160",
  name: "RIPEMD-160",
  description: "Computes RIPEMD-160 digest. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: async ({ input }) => {
    const { ripemd160 } = (await import("hash-wasm")) as {
      ripemd160: (data: Uint8Array) => Promise<string>;
    };
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const digest = await ripemd160(Uint8Array.from(bytes));
    return { type: "string", value: digest };
  }
};
