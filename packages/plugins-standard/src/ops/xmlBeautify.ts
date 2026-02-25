import type { Operation } from "@cybermasterchef/core";
import xmlFormatter from "xml-formatter";

export const xmlBeautify: Operation = {
  id: "format.xmlBeautify",
  name: "XML Beautify",
  description: "Formats XML with indentation.",
  input: ["string"],
  output: "string",
  args: [
    { key: "indent", label: "Indent", type: "number", defaultValue: 2 }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const indent = typeof args.indent === "number" ? Math.max(0, args.indent) : 2;
    try {
      const value = xmlFormatter(input.value, { indentation: " ".repeat(indent) });
      return { type: "string", value };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to beautify XML: ${reason}`, { cause: error });
    }
  }
};
