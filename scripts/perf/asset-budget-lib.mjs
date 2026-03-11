import { resolve } from "node:path";

export function pickLargestAsset(distAssetsDir, hits, statSyncFn) {
  return (
    [...hits].sort((left, right) => {
      const leftSize = statSyncFn(resolve(distAssetsDir, left)).size;
      const rightSize = statSyncFn(resolve(distAssetsDir, right)).size;
      return rightSize - leftSize;
    })[0] ?? null
  );
}

export function findAsset(distAssetsDir, files, label, matcher, pick = (hits) => hits[0]) {
  const hits = files.filter((file) => matcher(file));
  if (hits.length === 0) {
    throw new Error(`[perf-assets] missing asset for '${label}'`);
  }
  const hit = pick(hits);
  if (!hit) {
    throw new Error(`[perf-assets] missing asset for '${label}'`);
  }
  return resolve(distAssetsDir, hit);
}

export function validateAssetBudgets(targets, readFileSyncFn) {
  const lines = [];
  for (const target of targets) {
    const sizeBytes = readFileSyncFn(target.path).byteLength;
    if (sizeBytes > target.maxBytes) {
      throw new Error(
        `[perf-assets] ${target.label} exceeds budget: ${sizeBytes} > ${target.maxBytes}`
      );
    }
    lines.push(`[perf-assets] ${target.label}: ${sizeBytes} bytes (budget ${target.maxBytes})`);
  }
  return lines;
}
