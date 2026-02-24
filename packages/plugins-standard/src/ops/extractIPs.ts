import type { Operation } from "@cybermasterchef/core";

const CANDIDATE_IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

function isValidIpv4(candidate: string): boolean {
  const octets = candidate.split(".");
  if (octets.length !== 4) return false;
  for (const octet of octets) {
    if (!/^\d{1,3}$/.test(octet)) return false;
    if (octet.length > 1 && octet.startsWith("0")) return false;
    const value = Number(octet);
    if (!Number.isInteger(value) || value < 0 || value > 255) return false;
  }
  return true;
}

export const extractIPs: Operation = {
  id: "network.extractIPs",
  name: "Extract IPs",
  description: "Extracts unique IPv4 addresses from text input.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const found = input.value.match(CANDIDATE_IPV4) ?? [];
    const unique = new Set<string>();
    for (const candidate of found) {
      if (isValidIpv4(candidate)) unique.add(candidate);
    }
    return { type: "string", value: Array.from(unique).join("\n") };
  }
};
