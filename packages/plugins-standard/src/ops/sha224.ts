import type { Operation } from "@cybermasterchef/core";
import { sha224 as sha224Hash } from "hash-wasm";

export const sha224: Operation = {
  id: "hash.sha224",
  name: "SHA-224",
  description: "Computes SHA-224 digest. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: async ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes = input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const digest = await sha224Hash(Uint8Array.from(bytes));
    return { type: "string", value: digest };
  }
};
