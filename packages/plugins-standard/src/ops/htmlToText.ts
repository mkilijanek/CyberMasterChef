import type { Operation } from "@cybermasterchef/core";
import { htmlToText } from "html-to-text";

export const htmlToTextOp: Operation = {
  id: "format.htmlToText",
  name: "HTML To Text",
  description: "Converts HTML markup to plain text.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const value = htmlToText(input.value, { wordwrap: false });
    return { type: "string", value };
  }
};
