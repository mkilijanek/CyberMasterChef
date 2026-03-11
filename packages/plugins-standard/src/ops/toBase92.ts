import type { Operation } from "@cybermasterchef/core";
import { encodeBase92 } from "./base92Utils.js";

export const toBase92: Operation = {
  id: "codec.toBase92",
  name: "To Base92",
  description: "Encodes bytes or string to Base92.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    return { type: "string", value: encodeBase92(bytes) };
  }
};
