import type { Operation } from "@cybermasterchef/core";

export const bzip2Decompress: Operation = {
  id: "compression.bzip2Decompress",
  name: "Bzip2 Decompress",
  description: "Decompresses Bzip2 data into raw bytes.",
  input: ["bytes"],
  output: "bytes",
  args: [],
  run: async ({ input }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const { Bzip2 } = (await import("compressjs")) as {
      Bzip2: {
        decompressFile: (data: Uint8Array) => number[];
      };
    };
    try {
      const decompressed = Bzip2.decompressFile(input.value);
      return { type: "bytes", value: Uint8Array.from(decompressed) };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to bzip2 decompress input: ${reason}`, { cause: error });
    }
  }
};
