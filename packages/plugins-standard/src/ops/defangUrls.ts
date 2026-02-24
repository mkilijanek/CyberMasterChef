import type { Operation } from "@cybermasterchef/core";

const URL_REGEX = /\bhttps?:\/\/[^\s"'<>]+/gi;
const TRAILING_PUNCTUATION = /[),.;:!?]+$/;

function defangSingleUrl(url: string): string {
  const clean = url.replace(TRAILING_PUNCTUATION, "");
  try {
    const parsed = new URL(clean);
    const protocol = parsed.protocol === "https:" ? "hxxps:" : "hxxp:";
    const host = parsed.hostname.replaceAll(".", "[.]");
    const port = parsed.port.length > 0 ? `:${parsed.port}` : "";
    return `${protocol}//${host}${port}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return clean
      .replace(/^https:\/\//i, "hxxps://")
      .replace(/^http:\/\//i, "hxxp://")
      .replace(/\./g, "[.]");
  }
}

export const defangUrls: Operation = {
  id: "network.defangUrls",
  name: "Defang URLs",
  description: "Defangs HTTP/HTTPS URLs by replacing protocol and host dots.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const transformed = input.value.replace(URL_REGEX, (value) => defangSingleUrl(value));
    return { type: "string", value: transformed };
  }
};
