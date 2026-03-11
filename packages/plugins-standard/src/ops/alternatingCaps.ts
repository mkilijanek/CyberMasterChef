import type { Operation } from "@cybermasterchef/core";

export const alternatingCaps: Operation = {
  id: "text.alternatingCaps",
  name: "Alternating Caps",
  description: "Alternates the case of letters while preserving non-letter characters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") {
      throw new Error("Expected string input");
    }
    let uppercaseNext = true;
    let output = "";
    for (const char of input.value) {
      if (/[a-z]/i.test(char)) {
        output += uppercaseNext ? char.toUpperCase() : char.toLowerCase();
        uppercaseNext = !uppercaseNext;
        continue;
      }
      output += char;
    }
    return { type: "string", value: output };
  }
};
