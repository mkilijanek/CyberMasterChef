import type { Operation } from "@cybermasterchef/core";

const MAC_REGEX =
  /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b|\b[0-9A-Fa-f]{4}(?:\.[0-9A-Fa-f]{4}){2}\b/g;

function normalizeMacAddress(value: string): string {
  const hex = value.replace(/[^0-9A-Fa-f]/g, "").toLowerCase();
  const pairs: string[] = [];
  for (let index = 0; index < hex.length; index += 2) {
    pairs.push(hex.slice(index, index + 2));
  }
  return pairs.join(":");
}

export const extractMacAddresses: Operation = {
  id: "network.extractMacAddresses",
  name: "Extract MAC Addresses",
  description: "Extracts unique MAC addresses and normalizes them to colon-separated lowercase.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const matches = input.value.match(MAC_REGEX) ?? [];
    const unique = new Set<string>();
    for (const match of matches) {
      unique.add(normalizeMacAddress(match));
    }
    return { type: "string", value: Array.from(unique).join("\n") };
  }
};
