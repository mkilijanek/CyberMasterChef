import type { DataValue, Recipe } from "@cybermasterchef/core";

export type BakeResult = {
  output: DataValue;
  trace: Array<{ step: number; opId: string; inputType: string; outputType: string; durationMs: number }>;
  run: {
    runId: string;
    startedAt: number;
    endedAt: number;
    durationMs: number;
    stepDurationTotalMs: number;
    stepDurationAvgMs: number;
    slowestStep: { step: number; opId: string; durationMs: number } | null;
    recipeHash: string;
    inputHash: string;
    queuedMs?: number;
    workerId?: number;
    attempt?: number;
    queueDepthAtEnqueue?: number;
    queueDepthAtStart?: number;
    maxQueueDepthObserved?: number;
    inFlightAtStart?: number;
    queueOverflowCount?: number;
  };
};

export interface ExecutionClient {
  init(): Promise<void>;
  bake(
    recipe: Recipe,
    input: DataValue,
    opts?: { timeoutMs?: number; priority?: "normal" | "high" }
  ): Promise<BakeResult>;
  cancelActive(): void;
  dispose(): void;
}
