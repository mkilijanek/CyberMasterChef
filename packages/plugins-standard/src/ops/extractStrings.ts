import type { Operation } from "@cybermasterchef/core";

function toAscii(value: Uint8Array): string {
  let out = "";
  for (const b of value) {
    out += String.fromCharCode(b);
  }
  return out;
}

function extractPrintable(input: string, minLen: number): string[] {
  const matches = input.match(/[\x20-\x7E]+/g) ?? [];
  return matches.filter((m) => m.length >= minLen);
}

export const extractStrings: Operation = {
  id: "forensic.extractStrings",
  name: "Extract Strings",
  description: "Extracts printable ASCII strings from bytes/string payload.",
  input: ["bytes", "string"],
  output: "string",
  args: [
    {
      key: "minLength",
      label: "Min length",
      type: "number",
      defaultValue: 4
    }
  ],
  run: ({ input, args }) => {
    const minArg = typeof args.minLength === "number" ? args.minLength : 4;
    const minLength = Math.max(1, Math.floor(minArg));
    const source = input.type === "bytes" ? toAscii(input.value) : input.type === "string" ? input.value : null;
    if (source === null) {
      throw new Error("Expected bytes or string input");
    }
    const lines = extractPrintable(source, minLength);
    return { type: "string", value: lines.join("\n") };
  }
};
