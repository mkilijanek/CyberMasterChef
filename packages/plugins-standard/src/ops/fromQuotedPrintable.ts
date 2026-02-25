import type { Operation } from "@cybermasterchef/core";
import quotedPrintable from "quoted-printable";

export const fromQuotedPrintable: Operation = {
  id: "format.fromQuotedPrintable",
  name: "From Quoted Printable",
  description: "Decodes quoted-printable text into UTF-8.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const decoded = quotedPrintable.decode(input.value);
    return { type: "string", value: decoded };
  }
};
