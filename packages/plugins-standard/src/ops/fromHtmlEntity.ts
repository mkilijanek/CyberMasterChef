import type { Operation } from "@cybermasterchef/core";
import he from "he";

export const fromHtmlEntity: Operation = {
  id: "format.fromHtmlEntity",
  name: "From HTML Entity",
  description: "Decodes HTML entities into text.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: he.decode(input.value) };
  }
};
