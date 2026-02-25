import type { Operation } from "@cybermasterchef/core";

const URL_REGEX = /\bhttps?:\/\/[^\s"'<>]+/gi;
const TRAILING_PUNCTUATION = /[),.;:!?]+$/;

export const extractUrls: Operation = {
  id: "network.extractUrls",
  name: "Extract URLs",
  description: "Extracts unique HTTP/HTTPS URLs from text input.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const matches = input.value.match(URL_REGEX) ?? [];
    const unique = new Set<string>();
    for (const match of matches) {
      unique.add(match.replace(TRAILING_PUNCTUATION, ""));
    }
    return { type: "string", value: Array.from(unique).join("\n") };
  }
};
