import type { Operation } from "@cybermasterchef/core";

export const replace: Operation = {
  id: "text.replace",
  name: "Replace",
  description: "Replaces text occurrences.",
  input: ["string"],
  output: "string",
  args: [
    {
      key: "find",
      label: "Find",
      type: "string",
      defaultValue: ""
    },
    {
      key: "replace",
      label: "Replace",
      type: "string",
      defaultValue: ""
    },
    {
      key: "all",
      label: "Replace all",
      type: "boolean",
      defaultValue: true
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const find = typeof args.find === "string" ? args.find : "";
    const replacement = typeof args.replace === "string" ? args.replace : "";
    const all = typeof args.all === "boolean" ? args.all : true;
    if (find.length === 0) return { type: "string", value: input.value };
    return {
      type: "string",
      value: all
        ? input.value.split(find).join(replacement)
        : input.value.replace(find, replacement)
    };
  }
};
