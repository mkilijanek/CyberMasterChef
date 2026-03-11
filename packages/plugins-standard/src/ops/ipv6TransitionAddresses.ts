import type { Operation } from "@cybermasterchef/core";
import { expandIpv6 } from "./ipAddressUtils.js";

function toIpv4String(left: number, right: number): string {
  return [
    (left >>> 8) & 0xff,
    left & 0xff,
    (right >>> 8) & 0xff,
    right & 0xff
  ].join(".");
}

function invertHextet(value: number): number {
  return (~value) & 0xffff;
}

function describeTransition(address: string) {
  const { hextets } = expandIpv6(address);
  if (hextets[0] === 0x2002) {
    return {
      address,
      scheme: "6to4",
      embeddedIpv4: toIpv4String(hextets[1]!, hextets[2]!)
    };
  }
  if (hextets[0] === 0x2001 && hextets[1] === 0x0000) {
    return {
      address,
      scheme: "teredo",
      serverIpv4: toIpv4String(hextets[2]!, hextets[3]!),
      clientIpv4: toIpv4String(invertHextet(hextets[6]!), invertHextet(hextets[7]!))
    };
  }
  if (
    hextets.slice(0, 5).every((part) => part === 0) &&
    hextets[5] === 0xffff
  ) {
    return {
      address,
      scheme: "ipv4-mapped",
      embeddedIpv4: toIpv4String(hextets[6]!, hextets[7]!)
    };
  }
  if (
    (hextets[4] === 0x0000 || hextets[4] === 0x0200) &&
    hextets[5] === 0x5efe &&
    hextets[6] !== undefined &&
    hextets[7] !== undefined
  ) {
    return {
      address,
      scheme: "isatap",
      embeddedIpv4: toIpv4String(hextets[6], hextets[7])
    };
  }
  return { address, scheme: "none" };
}

export const __ipv6TransitionInternal = {
  describeTransition,
  invertHextet,
  toIpv4String
};

export const ipv6TransitionAddresses: Operation = {
  id: "network.ipv6TransitionAddresses",
  name: "IPv6 Transition Addresses",
  description: "Detects 6to4, Teredo, ISATAP, and IPv4-mapped transition details in IPv6 addresses.",
  input: ["string"],
  output: "json",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const values = input.value
      .split(/[\s,]+/)
      .map((value) => value.trim())
      .filter(Boolean);
    if (values.length === 0) return { type: "json", value: [] };
    return { type: "json", value: values.map((value) => describeTransition(value)) };
  }
};
