export type TraceRow = {
  step: number;
  opId: string;
  inputType: string;
  outputType: string;
  durationMs: number;
};

export type TraceSummary = {
  steps: number;
  totalDurationMs: number;
  averageDurationMs: number;
  slowestStep: {
    step: number;
    opId: string;
    durationMs: number;
  } | null;
};

export function summarizeTrace(trace: TraceRow[]): TraceSummary {
  let totalDurationMs = 0;
  let slowestStep: TraceSummary["slowestStep"] = null;

  for (const row of trace) {
    totalDurationMs += row.durationMs;
    if (!slowestStep || row.durationMs > slowestStep.durationMs) {
      slowestStep = {
        step: row.step,
        opId: row.opId,
        durationMs: row.durationMs
      };
    }
  }

  return {
    steps: trace.length,
    totalDurationMs,
    averageDurationMs: trace.length > 0 ? totalDurationMs / trace.length : 0,
    slowestStep
  };
}
