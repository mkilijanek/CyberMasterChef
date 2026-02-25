import type { Operation } from "@cybermasterchef/core";

export const hashMd5: Operation = {
  id: "hash.md5",
  name: "MD5",
  description: "Computes MD5 digest. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: async ({ input }) => {
    const { md5 } = (await import("hash-wasm")) as {
      md5: (data: Uint8Array) => Promise<string>;
    };
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const digest = await md5(bytes);
    return { type: "string", value: digest };
  }
};
