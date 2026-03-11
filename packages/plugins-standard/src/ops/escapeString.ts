import type { Operation } from "@cybermasterchef/core";

function escapeOnce(value: string): string {
  return JSON.stringify(value)
    .slice(1, -1)
    .replace(/'/g, "\\'");
}

function normalizeLevel(value: unknown): number {
  const level = Math.floor(typeof value === "number" ? value : 1);
  if (!Number.isFinite(level) || level < 0 || level > 10) {
    throw new Error("Escape level must be between 0 and 10");
  }
  return level;
}

export const escapeString: Operation = {
  id: "text.escapeString",
  name: "Escape String",
  description: "Escapes control characters, backslashes, and quotes repeatedly.",
  input: ["string"],
  output: "string",
  args: [{ key: "escapeLevel", label: "Escape level", type: "number", defaultValue: 1 }],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const level = normalizeLevel(args.escapeLevel);
    let current = input.value;
    for (let iteration = 0; iteration < level; iteration++) {
      current = escapeOnce(current);
    }
    return { type: "string", value: current };
  }
};
