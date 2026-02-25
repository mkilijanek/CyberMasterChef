import type { Operation } from "@cybermasterchef/core";

const CVE_REGEX = /\bCVE-\d{4}-\d{4,7}\b/gi;

export const extractCves: Operation = {
  id: "forensic.extractCves",
  name: "Extract CVEs",
  description: "Extracts unique CVE identifiers from text input.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const matches = input.value.match(CVE_REGEX) ?? [];
    const unique = new Set<string>();
    for (const match of matches) unique.add(match.toUpperCase());
    return { type: "string", value: Array.from(unique).join("\n") };
  }
};
