import type { Operation } from "@cybermasterchef/core";
import * as punycode from "punycode/punycode.js";

export const toPunycode: Operation = {
  id: "codec.toPunycode",
  name: "To Punycode",
  description: "Encodes Unicode text to Punycode or IDNA ASCII.",
  input: ["string"],
  output: "string",
  args: [
    {
      key: "idn",
      label: "Internationalised domain name",
      type: "boolean",
      defaultValue: false
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return {
      type: "string",
      value: args.idn === true ? punycode.toASCII(input.value) : punycode.encode(input.value)
    };
  }
};
