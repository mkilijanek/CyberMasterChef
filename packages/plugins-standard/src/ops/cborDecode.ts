import type { Operation } from "@cybermasterchef/core";

export const cborDecode: Operation = {
  id: "format.cborDecode",
  name: "CBOR Decode",
  description: "Decodes CBOR bytes into JSON.",
  input: ["bytes"],
  output: "json",
  args: [],
  run: async ({ input }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const { decodeFirstSync } = (await import("cbor")) as {
      decodeFirstSync: (input: Uint8Array) => unknown;
    };
    try {
      const value = decodeFirstSync(input.value);
      return { type: "json", value };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to decode CBOR input: ${reason}`, { cause: error });
    }
  }
};
