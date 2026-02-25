import type { Operation } from "@cybermasterchef/core";

function printable(byte: number): string {
  return byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : ".";
}

export const toHexdump: Operation = {
  id: "format.toHexdump",
  name: "To Hexdump",
  description: "Renders bytes into a classic hexdump format.",
  input: ["bytes", "string"],
  output: "string",
  args: [
    { key: "width", label: "Width", type: "number", defaultValue: 16 }
  ],
  run: ({ input, args }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const width = typeof args.width === "number" ? Math.max(1, args.width) : 16;

    const lines: string[] = [];
    for (let offset = 0; offset < bytes.length; offset += width) {
      const slice = bytes.slice(offset, offset + width);
      const hex = Array.from(slice, (b) => b.toString(16).padStart(2, "0")).join(" ");
      const ascii = Array.from(slice, (b) => printable(b)).join("");
      const offsetHex = offset.toString(16).padStart(8, "0");
      lines.push(`${offsetHex}  ${hex.padEnd(width * 3 - 1)}  ${ascii}`);
    }

    return { type: "string", value: lines.join("\n") };
  }
};
