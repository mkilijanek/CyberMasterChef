import type { Operation } from "@cybermasterchef/core";

export const fromBinary: Operation = {
  id: "codec.fromBinary",
  name: "From Binary",
  description: "Decodes binary octets to bytes.",
  input: ["string"],
  output: "bytes",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const raw = input.value.trim();
    if (!raw) return { type: "bytes", value: new Uint8Array() };

    const parts = raw.split(/\s+/).filter(Boolean);
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
