import { describe, expect, it } from "vitest";
import { summarizeTrace } from "../src/traceSummary.js";

describe("summarizeTrace", () => {
  it("returns zeroed summary for empty trace", () => {
    const summary = summarizeTrace([]);
    expect(summary.steps).toBe(0);
    expect(summary.totalDurationMs).toBe(0);
    expect(summary.averageDurationMs).toBe(0);
    expect(summary.slowestStep).toBeNull();
  });

  it("aggregates durations and identifies slowest step", () => {
    const summary = summarizeTrace([
      {
        step: 0,
        opId: "text.trim",
        inputType: "string",
        outputType: "string",
        durationMs: 3
      },
      {
        step: 1,
        opId: "text.reverse",
        inputType: "string",
        outputType: "string",
        durationMs: 9
      }
    ]);

    expect(summary.steps).toBe(2);
    expect(summary.totalDurationMs).toBe(12);
    expect(summary.averageDurationMs).toBe(6);
    expect(summary.slowestStep).toEqual({
      step: 1,
      opId: "text.reverse",
      durationMs: 9
    });
  });
});
