import type { Operation } from "@cybermasterchef/core";

function sameRangeClass(start: string, end: string): boolean {
  return (
    (/^[a-z]$/.test(start) && /^[a-z]$/.test(end)) ||
    (/^[A-Z]$/.test(start) && /^[A-Z]$/.test(end)) ||
    (/^[0-9]$/.test(start) && /^[0-9]$/.test(end))
  );
}

function expandRange(start: string, end: string, delimiter: string): string {
  const startCode = start.charCodeAt(0);
  const endCode = end.charCodeAt(0);
  const step = startCode <= endCode ? 1 : -1;
  const expanded: string[] = [];
  for (let code = startCode; step > 0 ? code <= endCode : code >= endCode; code += step) {
    expanded.push(String.fromCharCode(code));
  }
  return expanded.join(delimiter);
}

export const expandAlphabetRange: Operation = {
  id: "text.expandAlphabetRange",
  name: "Expand Alphabet Range",
  description: "Expands inline ranges such as a-z, A-D, or 0-3.",
  input: ["string"],
  output: "string",
  args: [{ key: "delimiter", label: "Delimiter", type: "string", defaultValue: "" }],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const delimiter = typeof args.delimiter === "string" ? args.delimiter : "";
    let output = "";
    for (let index = 0; index < input.value.length; index++) {
      const current = input.value[index];
      const separator = input.value[index + 1];
      const next = input.value[index + 2];
      if (current && separator === "-" && next && sameRangeClass(current, next)) {
        output += expandRange(current, next, delimiter);
        index += 2;
        continue;
      }
      output += current;
    }
    return { type: "string", value: output };
  }
};
