import type { Operation } from "@cybermasterchef/core";
import quotedPrintable from "quoted-printable";

export const toQuotedPrintable: Operation = {
  id: "format.toQuotedPrintable",
  name: "To Quoted Printable",
  description: "Encodes UTF-8 text into quoted-printable.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const encoded = quotedPrintable.encode(input.value);
    return { type: "string", value: encoded };
  }
};
