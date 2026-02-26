import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..", "..");
const distAssetsDir = resolve(repoRoot, "packages", "workbench", "dist", "assets");
const budgetsPath = resolve(repoRoot, "docs", "perf", "asset-budgets.json");

const budgets = JSON.parse(readFileSync(budgetsPath, "utf-8"));
const files = readdirSync(distAssetsDir);

function findAsset(prefix) {
  const hit = files.find((file) => file.startsWith(prefix) && file.endsWith(".js"));
  if (!hit) {
    throw new Error(`[perf-assets] missing asset with prefix '${prefix}'`);
  }
  return resolve(distAssetsDir, hit);
}

const targets = [
  {
    label: "sandbox.worker.js",
    path: findAsset("sandbox.worker-"),
    maxBytes: budgets.assets["sandbox.worker.js"]
  },
  {
    label: "vendor.js",
    path: findAsset("vendor-"),
    maxBytes: budgets.assets["vendor.js"]
  }
];

for (const target of targets) {
  const sizeBytes = statSync(target.path).size ?? readFileSync(target.path).byteLength;
  if (sizeBytes > target.maxBytes) {
    throw new Error(
      `[perf-assets] ${target.label} exceeds budget: ${sizeBytes} > ${target.maxBytes}`
    );
  }
  process.stdout.write(`[perf-assets] ${target.label}: ${sizeBytes} bytes (budget ${target.maxBytes})\n`);
}
