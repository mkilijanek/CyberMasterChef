import type { Operation } from "@cybermasterchef/core";
import { hexToBytes } from "@cybermasterchef/core";

export const fromHex: Operation = {
  id: "codec.fromHex",
  name: "From Hex",
  description: "Decodes hexadecimal string (spaces allowed) to bytes.",
  input: ["string"],
  output: "bytes",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "bytes", value: hexToBytes(input.value) };
  }
};
