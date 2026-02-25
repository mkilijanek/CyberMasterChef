import type { Operation } from "@cybermasterchef/core";

export const bzip2Compress: Operation = {
  id: "compression.bzip2",
  name: "Bzip2 Compress",
  description: "Compresses input with Bzip2.",
  input: ["bytes", "string"],
  output: "bytes",
  args: [],
  run: async ({ input }) => {
    const { Bzip2 } = (await import("compressjs")) as {
      Bzip2: {
        compressFile: (data: Uint8Array) => number[];
      };
    };
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const compressed = Bzip2.compressFile(bytes);
    return { type: "bytes", value: Uint8Array.from(compressed) };
  }
};
