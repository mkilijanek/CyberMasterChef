import type { Operation } from "@cybermasterchef/core";
import { base64ToBytes } from "@cybermasterchef/core";

export const fromBase64: Operation = {
  id: "codec.fromBase64",
  name: "From Base64",
  description: "Decodes Base64 string to bytes.",
  input: ["string"],
  output: "bytes",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "bytes", value: base64ToBytes(input.value) };
  }
};
