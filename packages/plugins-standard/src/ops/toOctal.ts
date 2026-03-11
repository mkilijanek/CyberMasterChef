import type { Operation } from "@cybermasterchef/core";

export const toOctal: Operation = {
  id: "codec.toOctal",
  name: "To Octal",
  description: "Encodes bytes or string into delimited octal byte values.",
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
    const octal = Array.from(bytes, (b) => b.toString(8).padStart(3, "0"));
    return { type: "string", value: octal.join(delimiter) };
  }
};
