import type { Operation } from "@cybermasterchef/core";

type UuidAnalysis = {
  input: string;
  normalized?: string;
  isValid: boolean;
  version?: number;
  variant?: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function detectVariant(nibble: number): string {
  if ((nibble & 0x8) === 0x0) return "NCS";
  if ((nibble & 0xc) === 0x8) return "RFC4122";
  if ((nibble & 0xe) === 0xc) return "Microsoft";
  return "Future";
}

export const analyseUuid: Operation = {
  id: "forensic.analyseUuid",
  name: "Analyse UUID",
  description: "Inspects UUID format, version, and variant.",
  input: ["string"],
  output: "json",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const trimmed = input.value.trim();
    if (!UUID_RE.test(trimmed)) {
      const invalid: UuidAnalysis = { input: trimmed, isValid: false };
      return { type: "json", value: invalid };
    }
    const normalized = trimmed.toLowerCase();
    const version = Number.parseInt(normalized[14] ?? "", 16);
    const variantNibble = Number.parseInt(normalized[19] ?? "", 16);
    const analysis: UuidAnalysis = {
      input: trimmed,
      normalized,
      isValid: true
    };
    if (Number.isFinite(version)) analysis.version = version;
    if (Number.isFinite(variantNibble)) analysis.variant = detectVariant(variantNibble);
    return { type: "json", value: analysis };
  }
};
