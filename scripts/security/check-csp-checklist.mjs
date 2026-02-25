import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..", "..");
const checklistPath = resolve(repoRoot, "docs", "security", "csp-checklist.md");
const text = readFileSync(checklistPath, "utf-8");

const required = [
  "default-src 'self'",
  "script-src 'self'",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'"
];

for (const directive of required) {
  if (!text.includes(directive)) {
    throw new Error(`[security] missing CSP directive in checklist: ${directive}`);
  }
}

process.stdout.write("[security] CSP checklist contains required directives\n");
