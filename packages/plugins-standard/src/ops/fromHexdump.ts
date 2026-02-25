import type { Operation } from "@cybermasterchef/core";

export const fromHexdump: Operation = {
  id: "format.fromHexdump",
  name: "From Hexdump",
  description: "Decodes hex bytes from a hexdump string.",
  input: ["string"],
  output: "bytes",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const lines = input.value.split(/\r?\n/);
    const bytes: number[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const withoutOffset = /^[0-9a-fA-F]{8}\s{2}/.test(trimmed)
        ? trimmed.slice(10)
        : trimmed;
      const hexPart = withoutOffset.split(/\s{2,}/)[0] ?? "";
      const tokens = hexPart.match(/[0-9a-fA-F]{2}/g) ?? [];
      for (const token of tokens) {
        bytes.push(Number.parseInt(token, 16));
      }
    }
    return { type: "bytes", value: new Uint8Array(bytes) };
  }
};
