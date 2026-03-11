import type { Operation } from "@cybermasterchef/core";
import {
  digestHex,
  extractPrintableStrings,
  inputToBytes,
  toAscii
} from "./forensicUtils.js";

function sanitizeRuleName(value: string): string {
  const normalized = value
    .trim()
    .replace(/[^A-Za-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized === "" ? "generated_rule" : normalized;
}

function escapeYaraString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}

export const yaraRules: Operation = {
  id: "forensic.yaraRules",
  name: "YARA Rules",
  description: "Generates a deterministic YARA rule scaffold from printable strings and hashes.",
  input: ["bytes", "string"],
  output: "string",
  args: [
    {
      key: "ruleName",
      label: "Rule name",
      type: "string",
      defaultValue: "generated_rule"
    },
    {
      key: "maxStrings",
      label: "Max strings",
      type: "number",
      defaultValue: 8
    },
    {
      key: "minStringLength",
      label: "Min string length",
      type: "number",
      defaultValue: 6
    }
  ],
  run: async ({ input, args }) => {
    const bytes = inputToBytes(input);
    const ruleName = sanitizeRuleName(
      typeof args.ruleName === "string" ? args.ruleName : "generated_rule"
    );
    const maxStrings = Math.max(
      1,
      Math.floor(typeof args.maxStrings === "number" ? args.maxStrings : 8)
    );
    const minStringLength = Math.max(
      1,
      Math.floor(typeof args.minStringLength === "number" ? args.minStringLength : 6)
    );
    const strings = extractPrintableStrings(toAscii(bytes), minStringLength, maxStrings);
    const sha256 = await digestHex("SHA-256", bytes);
    const lines = [
      `rule ${ruleName} {`,
      "  meta:",
      '    generator = "CyberMasterChef"',
      `    sha256 = "${sha256}"`
    ];

    if (strings.length > 0) {
      lines.push("  strings:");
      strings.forEach((value, index) => {
        lines.push(`    $s${index + 1} = "${escapeYaraString(value)}" ascii wide`);
      });
      lines.push("  condition:");
      lines.push("    all of them");
    } else {
      lines.push("  condition:");
      lines.push("    filesize >= 0");
    }
    lines.push("}");
    return { type: "string", value: lines.join("\n") };
  }
};
