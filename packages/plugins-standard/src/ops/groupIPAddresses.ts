import type { Operation } from "@cybermasterchef/core";

const IPV4_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

function isValidIpv4(value: string): boolean {
  const parts = value.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false;
    const n = Number(part);
    return Number.isInteger(n) && n >= 0 && n <= 255;
  });
}

function ipv4ToInt(ip: string): number {
  const [a, b, c, d] = ip.split(".").map((v) => Number(v));
  return (((a ?? 0) << 24) | ((b ?? 0) << 16) | ((c ?? 0) << 8) | (d ?? 0)) >>> 0;
}

function intToIpv4(value: number): string {
  const a = (value >>> 24) & 255;
  const b = (value >>> 16) & 255;
  const c = (value >>> 8) & 255;
  const d = value & 255;
  return `${a}.${b}.${c}.${d}`;
}

function networkBase(ip: string, prefixLength: number): string {
  const raw = ipv4ToInt(ip);
  const mask = prefixLength === 0 ? 0 : (0xffffffff << (32 - prefixLength)) >>> 0;
  const base = raw & mask;
  return `${intToIpv4(base)}/${prefixLength}`;
}

export const groupIPAddresses: Operation = {
  id: "network.groupIPAddresses",
  name: "Group IP Addresses",
  description: "Groups IPv4 addresses by CIDR prefix and outputs group counts.",
  input: ["bytes", "string"],
  output: "string",
  args: [
    {
      key: "prefixLength",
      label: "Prefix Length",
      type: "number",
      defaultValue: 24
    },
    {
      key: "includeCounts",
      label: "Include counts",
      type: "boolean",
      defaultValue: true
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const text = input.type === "bytes" ? new TextDecoder().decode(input.value) : input.value;
    const prefixLengthArg = typeof args.prefixLength === "number" ? Math.floor(args.prefixLength) : 24;
    const prefixLength = Math.max(0, Math.min(32, prefixLengthArg));
    const includeCounts = args.includeCounts !== false;

    const grouped = new Map<string, number>();
    for (const match of text.matchAll(IPV4_REGEX)) {
      const ip = match[0];
      if (!ip || !isValidIpv4(ip)) continue;
      const key = networkBase(ip, prefixLength);
      grouped.set(key, (grouped.get(key) ?? 0) + 1);
    }

    const rows = [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));
    const output = rows
      .map(([cidr, count]) => (includeCounts ? `${cidr}\t${count}` : cidr))
      .join("\n");
    return { type: "string", value: output };
  }
};
