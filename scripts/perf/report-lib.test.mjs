import assert from "node:assert/strict";
import test from "node:test";
import {
  buildReportPayload,
  createBudgetResults,
  median,
  renderMarkdownReport,
  summarizeBudgetFailures
} from "./report-lib.mjs";

test("median handles odd and even sample counts", () => {
  assert.equal(median([5, 1, 9]), 5);
  assert.equal(median([10, 2, 6, 4]), 5);
});

test("createBudgetResults maps budgets and rejects missing entries", () => {
  assert.deepEqual(
    createBudgetResults(
      [{ label: "bench.a", medianMs: 10, maxMs: 12, samplesMs: [10, 12] }],
      [{ label: "bench.a", maxMedianMs: 20 }]
    ),
    [
      {
        label: "bench.a",
        medianMs: 10,
        maxMs: 12,
        samplesMs: [10, 12],
        budgetMs: 20,
        ok: true
      }
    ]
  );
  assert.throws(
    () => createBudgetResults([{ label: "bench.missing", medianMs: 1, maxMs: 1, samplesMs: [1] }], []),
    /Missing budget for benchmark 'bench\.missing'/
  );
});

test("summarizeBudgetFailures returns only failing rows", () => {
  assert.deepEqual(
    summarizeBudgetFailures([
      { label: "a", medianMs: 10, budgetMs: 20, ok: true },
      { label: "b", medianMs: 30, budgetMs: 20, ok: false }
    ]),
    ["b: median 30ms > budget 20ms"]
  );
});

test("buildReportPayload and renderMarkdownReport produce deterministic output", () => {
  const payload = buildReportPayload(
    [
      { label: "bench.a", medianMs: 10, maxMs: 12, budgetMs: 20, ok: true },
      { label: "bench.b", medianMs: 30, maxMs: 35, budgetMs: 25, ok: false }
    ],
    ["bench.b: median 30ms > budget 25ms"],
    "1970-01-01T00:00:00.000Z"
  );
  assert.deepEqual(payload, {
    generatedAt: "1970-01-01T00:00:00.000Z",
    results: [
      { label: "bench.a", medianMs: 10, maxMs: 12, budgetMs: 20, ok: true },
      { label: "bench.b", medianMs: 30, maxMs: 35, budgetMs: 25, ok: false }
    ],
    failures: ["bench.b: median 30ms > budget 25ms"]
  });
  assert.equal(
    renderMarkdownReport(payload),
    [
      "# Performance Budget Report",
      "",
      "Generated: 1970-01-01T00:00:00.000Z",
      "",
      "| Benchmark | Median (ms) | Max (ms) | Budget (ms) | Status |",
      "| --- | ---: | ---: | ---: | --- |",
      "| bench.a | 10.000 | 12.000 | 20.000 | OK |",
      "| bench.b | 30.000 | 35.000 | 25.000 | FAIL |",
      "",
      "## Failures",
      "",
      "- bench.b: median 30ms > budget 25ms",
      ""
    ].join("\n")
  );
});
