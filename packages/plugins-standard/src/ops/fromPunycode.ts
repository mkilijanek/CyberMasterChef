import type { Operation } from "@cybermasterchef/core";
import * as punycode from "punycode/punycode.js";

export const fromPunycode: Operation = {
  id: "codec.fromPunycode",
  name: "From Punycode",
  description: "Decodes Punycode or IDNA ASCII to Unicode text.",
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
      value: args.idn === true ? punycode.toUnicode(input.value) : punycode.decode(input.value)
    };
  }
};
