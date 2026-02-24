import type { Operation } from "@cybermasterchef/core";

export const onlyPrintableAscii: Operation = {
  id: "text.onlyPrintableAscii",
  name: "Only Printable ASCII",
  description: "Keeps printable ASCII characters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[^\x20-\x7E]+/gu, "") };
  }
};
