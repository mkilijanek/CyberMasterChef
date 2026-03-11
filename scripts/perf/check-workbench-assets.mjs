import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { findAsset, pickLargestAsset, validateAssetBudgets } from "./asset-budget-lib.mjs";

const repoRoot = resolve(import.meta.dirname, "..", "..");
const distAssetsDir = resolve(repoRoot, "packages", "workbench", "dist", "assets");
const budgetsPath = resolve(repoRoot, "docs", "perf", "asset-budgets.json");

const budgets = JSON.parse(readFileSync(budgetsPath, "utf-8"));
const files = readdirSync(distAssetsDir);

const targets = [
  {
    label: "sandbox.worker.js",
    path: findAsset(distAssetsDir, files, "sandbox.worker.js", (file) =>
      /^sandbox\.worker-[^.]+\.js$/.test(file)
    ),
    maxBytes: budgets.assets["sandbox.worker.js"]
  },
  {
    label: "vendor.js",
    path: findAsset(
      distAssetsDir,
      files,
      "vendor.js",
      (file) => /^vendor-[^.]+\.js$/.test(file),
      (hits) =>
        pickLargestAsset(distAssetsDir, hits, (path) => statSync(path))
    ),
    maxBytes: budgets.assets["vendor.js"]
  }
];

for (const line of validateAssetBudgets(targets, readFileSync)) {
  process.stdout.write(`${line}\n`);
}
