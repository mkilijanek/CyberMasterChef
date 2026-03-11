import type { Operation } from "@cybermasterchef/core";
import { compressIpv6, expandIpv6, expandIpv6String } from "./ipAddressUtils.js";

function classifyIpv6(hextets: number[]): string {
  const h0 = hextets[0] ?? 0;
  const h1 = hextets[1] ?? 0;
  const h5 = hextets[5] ?? 0;
  const h7 = hextets[7] ?? 0;
  if (hextets.every((part) => part === 0)) return "unspecified";
  if (hextets.slice(0, 7).every((part) => part === 0) && h7 === 1) return "loopback";
  if (h0 === 0x2001 && h1 === 0x0db8) return "documentation";
  if ((h0 & 0xff00) === 0xff00) return "multicast";
  if ((h0 & 0xfe00) === 0xfc00) return "unique-local";
  if ((h0 & 0xffc0) === 0xfe80) return "link-local";
  if (
    hextets.slice(0, 5).every((part) => part === 0) &&
    h5 === 0xffff
  ) {
    return "ipv4-mapped";
  }
  return "global-unicast";
}

export const parseIPv6Address: Operation = {
  id: "network.parseIPv6Address",
  name: "Parse IPv6 Address",
  description: "Parses and normalizes an IPv6 address into compressed and expanded forms.",
  input: ["string"],
  output: "json",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") {
      throw new Error("Expected string input");
    }
    const { hextets, zone } = expandIpv6(input.value);
    return {
      type: "json",
      value: {
        version: 6,
        compressed: compressIpv6(hextets),
        expanded: expandIpv6String(hextets),
        kind: classifyIpv6(hextets),
        zone: zone ?? null
      }
    };
  }
};
