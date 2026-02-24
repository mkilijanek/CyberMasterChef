import type { Operation } from "@cybermasterchef/core";
import { bytesToBase64 } from "@cybermasterchef/core";

export const toBase64: Operation = {
  id: "codec.toBase64",
  name: "To Base64",
  description: "Encodes bytes or string to Base64.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    return { type: "string", value: bytesToBase64(bytes) };
  }
};
