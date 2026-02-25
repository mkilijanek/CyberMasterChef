import type { Operation } from "@cybermasterchef/core";

export const toCharcode: Operation = {
  id: "codec.toCharcode",
  name: "To Charcode",
  description: "Encodes bytes or string into character codes.",
  input: ["bytes", "string"],
  output: "string",
  args: [
    {
      key: "delimiter",
      label: "Delimiter",
      type: "string",
      defaultValue: " "
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const delimiter = typeof args.delimiter === "string" ? args.delimiter : " ";
    return {
      type: "string",
      value: [...bytes].map((b) => b.toString(10)).join(delimiter)
    };
  }
};
