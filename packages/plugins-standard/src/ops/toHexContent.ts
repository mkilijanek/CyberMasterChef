import type { Operation } from "@cybermasterchef/core";
import { bytesToHex } from "@cybermasterchef/core";

export const toHexContent: Operation = {
  id: "codec.toHexContent",
  name: "To Hex Content",
  description: "Encodes bytes or string into lowercase hex content (no separators).",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    return { type: "string", value: bytesToHex(bytes) };
  }
};
