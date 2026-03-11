import type { Operation } from "@cybermasterchef/core";
import {
  bigIntToIpv6,
  compressIpv6,
  expandIpv6,
  intToIpv4,
  ipv4ToInt,
  ipv6ToBigInt,
  isValidIpv4
} from "./ipAddressUtils.js";

function parseIpv4(input: string): number {
  if (!isValidIpv4(input)) {
    throw new Error(`Invalid IPv4 address: ${input}`);
  }
  return ipv4ToInt(input);
}

function parsePrefix(input: string, bits: number): number {
  const prefix = Number.parseInt(input, 10);
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > bits) {
    throw new Error(`Invalid CIDR prefix length: ${input}`);
  }
  return prefix;
}

function ipv4Mask(prefix: number): number {
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}

export const parseIPRange: Operation = {
  id: "network.parseIPRange",
  name: "Parse IP Range",
  description: "Parses IPv4/IPv6 CIDR blocks or explicit ranges and reports normalized bounds.",
  input: ["string"],
  output: "json",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") {
      throw new Error("Expected string input");
    }

    const raw = input.value.trim();
    if (!raw) {
      throw new Error("Expected IP range input");
    }

    if (raw.includes("/")) {
      const [baseRaw, prefixRaw] = raw.split("/", 2);
      if (!baseRaw || !prefixRaw) {
        throw new Error("Expected CIDR input in the form address/prefix");
      }
      if (baseRaw.includes(":")) {
        const { hextets } = expandIpv6(baseRaw);
        const prefix = parsePrefix(prefixRaw, 128);
        const value = ipv6ToBigInt(hextets);
        const hostBits = 128n - BigInt(prefix);
        const network = hostBits === 128n ? 0n : (value >> hostBits) << hostBits;
        const end = hostBits === 0n ? network : network | ((1n << hostBits) - 1n);
        return {
          type: "json",
          value: {
            kind: "cidr",
            version: 6,
            input: raw,
            prefixLength: prefix,
            network: compressIpv6(bigIntToIpv6(network)),
            start: compressIpv6(bigIntToIpv6(network)),
            end: compressIpv6(bigIntToIpv6(end)),
            count: (end - network + 1n).toString()
          }
        };
      }

      const prefix = parsePrefix(prefixRaw, 32);
      const value = parseIpv4(baseRaw);
      const mask = ipv4Mask(prefix);
      const network = value & mask;
      const broadcast = network | (~mask >>> 0);
      const firstHost = prefix >= 31 ? network : network + 1;
      const lastHost = prefix >= 31 ? broadcast : broadcast - 1;
      return {
        type: "json",
        value: {
          kind: "cidr",
          version: 4,
          input: raw,
          prefixLength: prefix,
          network: intToIpv4(network),
          broadcast: intToIpv4(broadcast),
          start: intToIpv4(network),
          end: intToIpv4(broadcast),
          firstHost: intToIpv4(firstHost),
          lastHost: intToIpv4(lastHost),
          count: String(broadcast - network + 1)
        }
      };
    }

    if (raw.includes("-")) {
      const [startRaw, endRaw] = raw.split("-", 2).map((part) => part.trim());
      if (!startRaw || !endRaw) {
        throw new Error("Expected explicit IP range in the form start-end");
      }
      if (startRaw.includes(":") || endRaw.includes(":")) {
        const start = ipv6ToBigInt(expandIpv6(startRaw).hextets);
        const end = ipv6ToBigInt(expandIpv6(endRaw).hextets);
        if (start > end) {
          throw new Error("IP range start must not exceed end");
        }
        return {
          type: "json",
          value: {
            kind: "range",
            version: 6,
            input: raw,
            start: compressIpv6(bigIntToIpv6(start)),
            end: compressIpv6(bigIntToIpv6(end)),
            count: (end - start + 1n).toString()
          }
        };
      }

      const start = parseIpv4(startRaw);
      const end = parseIpv4(endRaw);
      if (start > end) {
        throw new Error("IP range start must not exceed end");
      }
      return {
        type: "json",
        value: {
          kind: "range",
          version: 4,
          input: raw,
          start: intToIpv4(start),
          end: intToIpv4(end),
          count: String(end - start + 1)
        }
      };
    }

    if (raw.includes(":")) {
      const { hextets } = expandIpv6(raw);
      const normalized = compressIpv6(hextets);
      return {
        type: "json",
        value: {
          kind: "single",
          version: 6,
          input: raw,
          start: normalized,
          end: normalized,
          count: "1"
        }
      };
    }

    const value = parseIpv4(raw);
    const normalized = intToIpv4(value);
    return {
      type: "json",
      value: {
        kind: "single",
        version: 4,
        input: raw,
        start: normalized,
        end: normalized,
        count: "1"
      }
    };
  }
};
