import type { Operation } from "@cybermasterchef/core";

const EMAIL_REGEX = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi;

export const extractEmails: Operation = {
  id: "forensic.extractEmails",
  name: "Extract Emails",
  description: "Extracts unique email addresses from text input.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const matches = input.value.match(EMAIL_REGEX) ?? [];
    const unique = new Set<string>();
    for (const match of matches) unique.add(match.toLowerCase());
    return { type: "string", value: Array.from(unique).join("\n") };
  }
};
