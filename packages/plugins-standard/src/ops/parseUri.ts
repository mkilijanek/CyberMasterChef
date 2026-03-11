import type { Operation } from "@cybermasterchef/core";

function emptyToNull(value: string): string | null {
  return value ? value : null;
}

export const parseUri: Operation = {
  id: "network.parseUri",
  name: "Parse URI",
  description: "Parses an absolute URI into normalized components and query parameters.",
  input: ["string"],
  output: "json",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") {
      throw new Error("Expected string input");
    }
    const raw = input.value.trim();
    if (!raw) {
      throw new Error("Expected URI input");
    }
    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      throw new Error("Invalid absolute URI");
    }

    return {
      type: "json",
      value: {
        href: parsed.href,
        scheme: parsed.protocol.replace(/:$/, ""),
        username: emptyToNull(parsed.username),
        password: emptyToNull(parsed.password),
        origin: parsed.origin,
        host: parsed.host,
        hostname: parsed.hostname,
        port: emptyToNull(parsed.port),
        path: parsed.pathname,
        query: emptyToNull(parsed.search.slice(1)),
        fragment: emptyToNull(parsed.hash.slice(1)),
        queryParams: Array.from(parsed.searchParams.entries()).map(([key, value]) => ({
          key,
          value
        }))
      }
    };
  }
};
