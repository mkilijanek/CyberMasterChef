import type { Operation } from "@cybermasterchef/core";
import { encodeModhex } from "./modhexUtils.js";

export const toModhex: Operation = {
  id: "codec.toModhex",
  name: "To Modhex",
  description: "Encodes bytes or string to Modhex.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    return { type: "string", value: encodeModhex(bytes) };
  }
};
