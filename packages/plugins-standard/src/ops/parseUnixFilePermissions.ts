import type { Operation } from "@cybermasterchef/core";

const DIGIT_RE = /^[0-7]{3,4}$/;

function parseMode(raw: string): number {
  const trimmed = raw.trim();
  const normalized =
    trimmed.startsWith("0o") || trimmed.startsWith("0O")
      ? trimmed.slice(2)
      : trimmed.startsWith("0") && trimmed.length === 4
        ? trimmed.slice(1)
        : trimmed;
  if (!DIGIT_RE.test(normalized)) {
    throw new Error("Expected octal UNIX permission mode (e.g. 755, 0644, 0o600)");
  }
  const mode = Number.parseInt(normalized, 8);
  if (!Number.isInteger(mode) || mode < 0 || mode > 0o7777) {
    throw new Error("Invalid UNIX permission mode");
  }
  return mode;
}

function triplet(bits: number, special: "none" | "suid" | "sgid" | "sticky"): string {
  const read = (bits & 0b100) !== 0 ? "r" : "-";
  const write = (bits & 0b010) !== 0 ? "w" : "-";
  let execute = (bits & 0b001) !== 0 ? "x" : "-";

  if (special === "suid") execute = execute === "x" ? "s" : "S";
  if (special === "sgid") execute = execute === "x" ? "s" : "S";
  if (special === "sticky") execute = execute === "x" ? "t" : "T";

  return `${read}${write}${execute}`;
}

export const parseUnixFilePermissions: Operation = {
  id: "date.parseUnixFilePermissions",
  name: "Parse UNIX File Permissions",
  description: "Converts octal UNIX file mode into symbolic rwx notation.",
  input: ["string"],
  output: "string",
  args: [
    {
      key: "includeNumeric",
      label: "Include numeric mode",
      type: "boolean",
      defaultValue: true
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") {
      throw new Error("Expected string input");
    }
    const mode = parseMode(input.value);
    const ownerBits = (mode >> 6) & 0b111;
    const groupBits = (mode >> 3) & 0b111;
    const otherBits = mode & 0b111;
    const suid = (mode & 0o4000) !== 0;
    const sgid = (mode & 0o2000) !== 0;
    const sticky = (mode & 0o1000) !== 0;
    const symbolic =
      triplet(ownerBits, suid ? "suid" : "none") +
      triplet(groupBits, sgid ? "sgid" : "none") +
      triplet(otherBits, sticky ? "sticky" : "none");
    const includeNumeric = typeof args.includeNumeric === "boolean" ? args.includeNumeric : true;
    if (!includeNumeric) {
      return { type: "string", value: symbolic };
    }
    const octal = mode.toString(8).padStart(3, "0");
    return { type: "string", value: `${symbolic} (${octal})` };
  }
};
