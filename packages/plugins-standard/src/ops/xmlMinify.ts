import type { Operation } from "@cybermasterchef/core";

function minifyXml(value: string, preserveComments: boolean): string {
  let output = value.trim();
  if (!preserveComments) {
    output = output.replace(/<!--([\s\S]*?)-->/g, "");
  }
  output = output.replace(/>\s+</g, "><");
  output = output.replace(/>\s+([^<])/g, ">$1");
  output = output.replace(/([^>])\s+</g, "$1<");
  return output;
}

export const xmlMinify: Operation = {
  id: "format.xmlMinify",
  name: "XML Minify",
  description: "Minifies XML by removing whitespace between tags.",
  input: ["string"],
  output: "string",
  args: [
    {
      key: "preserveComments",
      label: "Preserve Comments",
      type: "boolean",
      defaultValue: true
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const preserveComments =
      typeof args.preserveComments === "boolean" ? args.preserveComments : true;
    const value = minifyXml(input.value, preserveComments);
    return { type: "string", value };
  }
};
