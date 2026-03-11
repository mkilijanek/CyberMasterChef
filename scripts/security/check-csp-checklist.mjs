import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateChecklistText } from "./csp-checklist-lib.mjs";

const repoRoot = resolve(import.meta.dirname, "..", "..");
const checklistPath = resolve(repoRoot, "docs", "security", "csp-checklist.md");
const text = readFileSync(checklistPath, "utf-8");

validateChecklistText(text);

process.stdout.write("[security] CSP checklist contains required directives\n");
