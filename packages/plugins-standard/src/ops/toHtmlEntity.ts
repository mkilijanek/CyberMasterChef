import type { Operation } from "@cybermasterchef/core";
import he from "he";

export const toHtmlEntity: Operation = {
  id: "format.toHtmlEntity",
  name: "To HTML Entity",
  description: "Encodes text to HTML entities.",
  input: ["string"],
  output: "string",
  args: [
    {
      key: "encodeEverything",
      label: "Encode Everything",
      type: "boolean",
      defaultValue: false
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const encodeEverything =
      typeof args.encodeEverything === "boolean" ? args.encodeEverything : false;
    const value = he.encode(input.value, {
      encodeEverything
    });
    return { type: "string", value };
  }
};
