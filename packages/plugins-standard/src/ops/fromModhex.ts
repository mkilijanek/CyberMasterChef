import type { Operation } from "@cybermasterchef/core";
import { decodeModhex } from "./modhexUtils.js";

export const fromModhex: Operation = {
  id: "codec.fromModhex",
  name: "From Modhex",
  description: "Decodes Modhex text to bytes.",
  input: ["string"],
  output: "bytes",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "bytes", value: decodeModhex(input.value) };
  }
};
