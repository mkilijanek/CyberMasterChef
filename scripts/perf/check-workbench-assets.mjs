import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..", "..");
const distAssetsDir = resolve(repoRoot, "packages", "workbench", "dist", "assets");
const budgetsPath = resolve(repoRoot, "docs", "perf", "asset-budgets.json");

const budgets = JSON.parse(readFileSync(budgetsPath, "utf-8"));
const files = readdirSync(distAssetsDir);

function findAsset(label, matcher) {
  const hits = files.filter((file) => matcher(file));
  if (hits.length === 0) {
    throw new Error(`[perf-assets] missing asset for '${label}'`);
  }
  if (hits.length > 1) {
    throw new Error(`[perf-assets] multiple assets matched '${label}': ${hits.join(", ")}`);
  }
  const [hit] = hits;
  if (!hit) {
    throw new Error(`[perf-assets] missing asset for '${label}'`);
  }
  return resolve(distAssetsDir, hit);
}

const targets = [
  {
    label: "sandbox.worker.js",
    path: findAsset("sandbox.worker.js", (file) => /^sandbox\.worker-[^.]+\.js$/.test(file)),
    maxBytes: budgets.assets["sandbox.worker.js"]
  },
  {
    label: "vendor.js",
    path: findAsset(
      "vendor.js",
      (file) => /^vendor-[^.]+\.js$/.test(file) && !file.slice("vendor-".length).includes("-")
    ),
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
