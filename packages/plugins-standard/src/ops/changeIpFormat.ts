import type { Operation } from "@cybermasterchef/core";

function parseIpv4Token(token: string): number {
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(token)) {
    const octets = token.split(".").map((part) => Number.parseInt(part, 10));
    if (octets.some((part) => part < 0 || part > 255)) {
      throw new Error(`Invalid IPv4 token: ${token}`);
    }
    const [first = 0, second = 0, third = 0, fourth = 0] = octets;
    return first * 16777216 + second * 65536 + third * 256 + fourth;
  }

  if (/^0x[0-9a-f]{8}$/i.test(token)) {
    return Number.parseInt(token.slice(2), 16);
  }

  if (/^[01]{32}$/.test(token)) {
    return Number.parseInt(token, 2);
  }

  if (/^\d+$/.test(token)) {
    const value = Number.parseInt(token, 10);
    if (!Number.isSafeInteger(value) || value < 0 || value > 0xffffffff) {
      throw new Error(`Invalid IPv4 token: ${token}`);
    }
    return value;
  }

  throw new Error(`Invalid IPv4 token: ${token}`);
}

function formatIpv4(value: number, outputFormat: string): string {
  if (outputFormat === "integer") {
    return String(value >>> 0);
  }
  if (outputFormat === "hex") {
    return `0x${(value >>> 0).toString(16).padStart(8, "0")}`;
  }
  if (outputFormat === "binary") {
    return (value >>> 0).toString(2).padStart(32, "0");
  }
  return [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff].join(
    "."
  );
}

export const changeIpFormat: Operation = {
  id: "network.changeIpFormat",
  name: "Change IP Format",
  description: "Converts IPv4 tokens between dotted-decimal, integer, hex, and binary forms.",
  input: ["string"],
  output: "string",
  args: [
    {
      key: "outputFormat",
      label: "Output format",
      type: "select",
      defaultValue: "dotted",
      options: [
        { label: "Dotted decimal", value: "dotted" },
        { label: "Integer", value: "integer" },
        { label: "Hex", value: "hex" },
        { label: "Binary", value: "binary" }
      ]
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const outputFormat = typeof args.outputFormat === "string" ? args.outputFormat : "dotted";
    const tokens = input.value
      .split(/[\s,]+/)
      .map((token) => token.trim())
      .filter(Boolean);
    if (tokens.length === 0) {
      return { type: "string", value: "" };
    }
    return {
      type: "string",
      value: tokens.map((token) => formatIpv4(parseIpv4Token(token), outputFormat)).join("\n")
    };
  }
};
