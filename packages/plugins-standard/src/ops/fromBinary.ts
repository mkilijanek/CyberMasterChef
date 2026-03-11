import type { Operation } from "@cybermasterchef/core";

function splitBinaryParts(raw: string, delimiter: unknown): string[] {
  const normalized = raw.trim();
  if (!normalized) return [];

  if (typeof delimiter === "string" && delimiter.length > 0) {
    return normalized
      .split(delimiter)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  return normalized.split(/\s+/).filter(Boolean);
}

export const fromBinary: Operation = {
  id: "codec.fromBinary",
  name: "From Binary",
  description: "Decodes binary octets to bytes.",
  input: ["string"],
  output: "bytes",
  args: [
    {
      key: "delimiter",
      label: "Delimiter",
      type: "string",
      defaultValue: ""
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const parts = splitBinaryParts(input.value, args.delimiter);
    const out = new Uint8Array(parts.length);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part || !/^[01]{8}$/.test(part)) {
        throw new Error(`Invalid binary octet: ${part}`);
      }
      out[i] = Number.parseInt(part, 2);
    }

    return { type: "bytes", value: out };
  }
};
