export function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function createBudgetResults(measured, budgetEntries) {
  const budgetMap = new Map(budgetEntries.map((entry) => [entry.label, entry.maxMedianMs]));
  return measured.map((row) => {
    const budget = budgetMap.get(row.label);
    if (typeof budget !== "number") {
      throw new Error(`Missing budget for benchmark '${row.label}'`);
    }
    return { ...row, budgetMs: budget, ok: row.medianMs <= budget };
  });
}

export function summarizeBudgetFailures(results) {
  return results
    .filter((row) => !row.ok)
    .map((row) => `${row.label}: median ${row.medianMs}ms > budget ${row.budgetMs}ms`);
}

export function buildReportPayload(results, failures, generatedAt) {
  return { generatedAt, results, failures };
}

export function renderMarkdownReport(payload) {
  const lines = [
    "# Performance Budget Report",
    "",
    `Generated: ${payload.generatedAt}`,
    "",
    "| Benchmark | Median (ms) | Max (ms) | Budget (ms) | Status |",
    "| --- | ---: | ---: | ---: | --- |"
  ];
  for (const row of payload.results) {
    lines.push(
      `| ${row.label} | ${row.medianMs.toFixed(3)} | ${row.maxMs.toFixed(3)} | ${row.budgetMs.toFixed(
        3
      )} | ${row.ok ? "OK" : "FAIL"} |`
    );
  }
  if (payload.failures.length > 0) {
    lines.push("", "## Failures", "");
    for (const failure of payload.failures) {
      lines.push(`- ${failure}`);
    }
  }
  return `${lines.join("\n")}\n`;
}
