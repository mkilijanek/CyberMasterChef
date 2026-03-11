import type { Operation } from "@cybermasterchef/core";

function decodeGroup(group: string): number[] {
  const padded = group.length < 5 ? group.padEnd(5, "u") : group;
  let value = 0;
  for (const char of padded) {
    const code = char.charCodeAt(0);
    if (code < 33 || code > 117) {
      throw new Error(`Invalid Base85 character: ${char}`);
    }
    value = value * 85 + (code - 33);
  }
  const bytes = [
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff
  ];
  return bytes.slice(0, Math.max(0, group.length - 1));
}

function decodeBase85(value: string): Uint8Array {
  const normalized = value.replace(/\s+/g, "");
  if (!normalized) return new Uint8Array();

  const bytes: number[] = [];
  let buffer = "";
  for (const char of normalized) {
    if (char === "z") {
      if (buffer) {
        throw new Error("Invalid Base85 zero shortcut placement");
      }
      bytes.push(0, 0, 0, 0);
      continue;
    }
    buffer += char;
    if (buffer.length === 5) {
      bytes.push(...decodeGroup(buffer));
      buffer = "";
    }
  }
  if (buffer.length === 1) {
    throw new Error("Invalid Base85 trailing group");
  }
  if (buffer) {
    bytes.push(...decodeGroup(buffer));
  }
  return Uint8Array.from(bytes);
}

export const fromBase85: Operation = {
  id: "codec.fromBase85",
  name: "From Base85",
  description: "Decodes ASCII85/Base85 string into bytes.",
  input: ["string"],
  output: "bytes",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "bytes", value: decodeBase85(input.value) };
  }
};
