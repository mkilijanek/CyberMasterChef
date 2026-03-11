import type { Operation } from "@cybermasterchef/core";
import { decodeBech32 } from "./bech32Utils.js";

export const fromBech32: Operation = {
  id: "codec.fromBech32",
  name: "From Bech32",
  description: "Decodes Bech32 string into bytes.",
  input: ["string"],
  output: "bytes",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "bytes", value: decodeBech32(input.value).bytes };
  }
};
