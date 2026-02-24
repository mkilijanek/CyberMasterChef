import type { Operation } from "@cybermasterchef/core";

export const rot13: Operation = {
  id: "text.rot13",
  name: "ROT13",
  description: "Applies ROT13 substitution for Latin letters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[a-z]/giu, (c) => String.fromCharCode(c <= "Z" ? ((c.charCodeAt(0) - 65 + 13) % 26) + 65 : ((c.charCodeAt(0) - 97 + 13) % 26) + 97)) };
  }
};
