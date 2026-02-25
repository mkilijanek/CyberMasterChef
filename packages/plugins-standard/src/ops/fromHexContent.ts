import type { Operation } from "@cybermasterchef/core";
import { hexToBytes } from "@cybermasterchef/core";

export const fromHexContent: Operation = {
  id: "codec.fromHexContent",
  name: "From Hex Content",
  description: "Decodes hex content into bytes, ignoring non-hex characters.",
  input: ["string"],
  output: "bytes",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const cleaned = input.value.replace(/[^0-9a-fA-F]/g, "");
    if (cleaned.length === 0) {
      return { type: "bytes", value: new Uint8Array() };
    }
    if (cleaned.length % 2 !== 0) {
      throw new Error("Hex content length must be even after cleanup");
    }
    return { type: "bytes", value: hexToBytes(cleaned) };
  }
};
