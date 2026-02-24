import type { Operation } from "@cybermasterchef/core";

export const urlEncode: Operation = {
  id: "codec.urlEncode",
  name: "URL Encode",
  description: "Percent-encodes text for URLs.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: encodeURIComponent(input.value) };
  }
};
