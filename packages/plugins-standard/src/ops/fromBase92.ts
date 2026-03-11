import type { Operation } from "@cybermasterchef/core";
import { decodeBase92 } from "./base92Utils.js";

export const fromBase92: Operation = {
  id: "codec.fromBase92",
  name: "From Base92",
  description: "Decodes Base92 text to bytes.",
  input: ["string"],
  output: "bytes",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "bytes", value: decodeBase92(input.value) };
  }
};
