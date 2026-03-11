import assert from "node:assert/strict";
import test from "node:test";
import { pickLargestAsset, findAsset, validateAssetBudgets } from "./asset-budget-lib.mjs";

test("pickLargestAsset selects the biggest matching asset", () => {
  const sizes = new Map([
    ["/dist/vendor-a.js", 100],
    ["/dist/vendor-b.js", 300],
    ["/dist/vendor-c.js", 200]
  ]);
  const picked = pickLargestAsset("/dist", ["vendor-a.js", "vendor-b.js", "vendor-c.js"], (path) => ({
    size: sizes.get(path) ?? 0
  }));
  assert.equal(picked, "vendor-b.js");
});

test("pickLargestAsset returns null for an empty match set", () => {
  assert.equal(pickLargestAsset("/dist", [], () => ({ size: 0 })), null);
});

test("findAsset resolves matches and rejects missing hits", () => {
  assert.equal(
    findAsset("/dist", ["sandbox.worker-abc.js"], "sandbox.worker.js", (file) =>
      file.startsWith("sandbox.worker-")
    ),
    "/dist/sandbox.worker-abc.js"
  );
  assert.throws(
    () => findAsset("/dist", ["other.js"], "vendor.js", (file) => file.startsWith("vendor-")),
    /missing asset for 'vendor\.js'/
  );
  assert.throws(
    () =>
      findAsset(
        "/dist",
        ["vendor-a.js"],
        "vendor.js",
        (file) => file.startsWith("vendor-"),
        () => null
      ),
    /missing asset for 'vendor\.js'/
  );
});

test("validateAssetBudgets reports passing assets and rejects overages", () => {
  const bufferMap = new Map([
    ["/dist/a.js", Buffer.alloc(10)],
    ["/dist/b.js", Buffer.alloc(20)]
  ]);
  assert.deepEqual(
    validateAssetBudgets(
      [
        { label: "a.js", path: "/dist/a.js", maxBytes: 10 },
        { label: "b.js", path: "/dist/b.js", maxBytes: 25 }
      ],
      (path) => bufferMap.get(path)
    ),
    [
      "[perf-assets] a.js: 10 bytes (budget 10)",
      "[perf-assets] b.js: 20 bytes (budget 25)"
    ]
  );
  assert.throws(
    () =>
      validateAssetBudgets([{ label: "b.js", path: "/dist/b.js", maxBytes: 5 }], (path) =>
        bufferMap.get(path)
      ),
    /b\.js exceeds budget: 20 > 5/
  );
});
