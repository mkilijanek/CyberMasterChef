import type { Operation } from "@cybermasterchef/core";
import { toBytes } from "./byteTransformUtils.js";

export const removeNullBytes: Operation = {
  id: "bytes.removeNullBytes",
  name: "Remove null bytes",
  description: "Removes all null bytes from the input.",
  input: ["bytes", "string"],
  output: "bytes",
  args: [],
  run: ({ input }) => {
    const bytes = toBytes(input);
    return {
      type: "bytes",
      value: Uint8Array.from(bytes.filter((byte) => byte !== 0))
    };
  }
};
