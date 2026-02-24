import type { Operation } from "@cybermasterchef/core";

function collectPaths(value: unknown, prefix: string, output: Set<string>): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const next = `${prefix}[${index}]`;
      output.add(next);
      collectPaths(item, next, output);
    });
    return;
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    for (const [key, nested] of entries) {
      const next = prefix.length > 0 ? `${prefix}.${key}` : key;
      output.add(next);
      collectPaths(nested, next, output);
    }
  }
}

export const jsonExtractKeys: Operation = {
  id: "format.jsonExtractKeys",
  name: "JSON Extract Keys",
  description: "Extracts recursively discovered key paths from JSON input.",
  input: ["string", "json"],
  output: "string",
  args: [],
  run: ({ input }) => {
    let parsed: unknown;
    if (input.type === "string") {
      try {
        parsed = JSON.parse(input.value) as unknown;
      } catch {
        throw new Error("Invalid JSON input");
      }
    } else if (input.type === "json") {
      parsed = input.value;
    } else {
      throw new Error("Expected string or json input");
    }

    const paths = new Set<string>();
    collectPaths(parsed, "", paths);
    return { type: "string", value: Array.from(paths).join("\n") };
  }
};
