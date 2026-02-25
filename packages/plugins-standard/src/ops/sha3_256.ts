import type { Operation } from "@cybermasterchef/core";

export const sha3_256: Operation = {
  id: "hash.sha3_256",
  name: "SHA3-256",
  description: "Computes SHA3-256 digest. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: async ({ input }) => {
    const { sha3 } = (await import("hash-wasm")) as {
      sha3: (data: Uint8Array, bits?: 224 | 256 | 384 | 512) => Promise<string>;
    };
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const digest = await sha3(bytes, 256);
    return { type: "string", value: digest };
  }
};
