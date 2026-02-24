import type { Operation } from "@cybermasterchef/core";
import { bytesToHex } from "@cybermasterchef/core";

export const toHex: Operation = {
  id: "codec.toHex",
  name: "To Hex",
  description: "Encodes bytes or string to lowercase hexadecimal.",
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
