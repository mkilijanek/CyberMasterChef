import type { Operation } from "@cybermasterchef/core";

export const stripHtmlTags: Operation = {
  id: "format.stripHtmlTags",
  name: "Strip HTML Tags",
  description: "Removes HTML tags from text.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const value = input.value.replace(/<[^>]*>/g, "");
    return { type: "string", value };
  }
};
