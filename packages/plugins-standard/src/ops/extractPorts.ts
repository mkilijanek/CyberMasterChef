import type { Operation } from "@cybermasterchef/core";

const PORT_PATTERNS = [
  /:(\d{1,5})\b/g,
  /\bport(?:=|:|\s+)(\d{1,5})\b/gi
];

export const extractPorts: Operation = {
  id: "network.extractPorts",
  name: "Extract Ports",
  description: "Extracts unique network port numbers (1-65535) from text input.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const unique = new Set<number>();
    for (const pattern of PORT_PATTERNS) {
      for (const match of input.value.matchAll(pattern)) {
        const portRaw = match[1];
        if (portRaw === undefined) continue;
        const port = Number.parseInt(portRaw, 10);
        if (Number.isInteger(port) && port >= 1 && port <= 65535) unique.add(port);
      }
    }
    const ordered = Array.from(unique).sort((a, b) => a - b);
    return { type: "string", value: ordered.join("\n") };
  }
};
