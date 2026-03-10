import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadImplementedOperations } from "./operation-inventory.mjs";

const repoRoot = resolve(import.meta.dirname, "..", "..");
const executionBoardPath = resolve(repoRoot, "docs", "parity", "c2-execution-board.md");
const planJsonPath = resolve(repoRoot, "docs", "parity", "c2-domain-implementation-plan.json");

const boardMd = readFileSync(executionBoardPath, "utf-8");
const plan = JSON.parse(readFileSync(planJsonPath, "utf-8"));
const implemented = loadImplementedOperations(repoRoot);

const implementedIds = new Set(implemented.map((op) => op.id));
const planImplementedIds = new Set(
  (plan.summary ?? []).flatMap((row) => (row.implementedOps ?? []).map((op) => op.id))
);

const boardOps = Array.from(
  new Set(
    [...boardMd.matchAll(/`([a-z]+(?:\.[A-Za-z0-9_]+)+)`/g)]
      .map((match) => match[1])
      .filter((value) => value !== undefined)
  )
);

const missingFromInventory = boardOps.filter((id) => !implementedIds.has(id));
const missingFromPlan = boardOps.filter((id) => !planImplementedIds.has(id));
const missingFromPlanIndex = implemented
  .map((op) => op.id)
  .filter((id) => !planImplementedIds.has(id));

if (missingFromInventory.length > 0) {
  throw new Error(
    `[c2] execution board references non-implemented operation IDs: ${missingFromInventory.join(", ")}`
  );
}

if (missingFromPlan.length > 0) {
  throw new Error(`[c2] execution board operation IDs missing from plan JSON: ${missingFromPlan.join(", ")}`);
}

if (missingFromPlanIndex.length > 0) {
  throw new Error(`[c2] implemented operation IDs missing from plan JSON: ${missingFromPlanIndex.join(", ")}`);
}

process.stdout.write(`[c2] plan drift check passed for ${boardOps.length} board operation IDs\n`);
