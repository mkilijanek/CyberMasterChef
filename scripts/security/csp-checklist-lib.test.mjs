import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { requiredDirectives, validateChecklistText } from "./csp-checklist-lib.mjs";

const repoRoot = resolve(import.meta.dirname, "..", "..");

test("validateChecklistText accepts the committed checklist", () => {
  const checklist = readFileSync(resolve(repoRoot, "docs", "security", "csp-checklist.md"), "utf8");
  assert.doesNotThrow(() => validateChecklistText(checklist));
  for (const directive of requiredDirectives) {
    assert.match(checklist, new RegExp(directive.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("validateChecklistText rejects missing directives", () => {
  assert.throws(
    () => validateChecklistText("default-src 'none'\nscript-src 'self'"),
    /missing CSP directive in checklist: style-src 'self'/
  );
});
