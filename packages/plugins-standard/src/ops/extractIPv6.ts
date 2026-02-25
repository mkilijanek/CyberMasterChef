import type { Operation } from "@cybermasterchef/core";

const IPV6_REGEX = /\b(?:[a-f0-9]{1,4}:){2,7}[a-f0-9]{1,4}\b/gi;

export const extractIPv6: Operation = {
  id: "network.extractIPv6",
  name: "Extract IPv6",
  description: "Extracts unique IPv6 address candidates from text input.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const matches = input.value.match(IPV6_REGEX) ?? [];
    const unique = new Set<string>();
    for (const match of matches) unique.add(match.toLowerCase());
    return { type: "string", value: Array.from(unique).join("\n") };
  }
};
