import { describe, expect, it } from "vitest";
import type { BakeResult, ExecutionClient } from "./clientTypes";
import { WorkerPoolClient } from "./poolClient";
import type { DataValue, Recipe } from "@cybermasterchef/core";

function makeResult(runId: string): BakeResult {
  return {
    output: { type: "string", value: runId },
    trace: [
      {
        step: 0,
        opId: "text.reverse",
        inputType: "string",
        outputType: "string",
        durationMs: 1
      }
    ],
    run: {
      runId,
      startedAt: 1,
      endedAt: 2,
      durationMs: 1,
      stepDurationTotalMs: 1,
      stepDurationAvgMs: 1,
      slowestStep: { step: 0, opId: "text.reverse", durationMs: 1 },
      recipeHash: "a".repeat(64),
      inputHash: "b".repeat(64)
    }
  };
}

class FakeClient implements ExecutionClient {
  public readonly calls: string[] = [];
  constructor(private readonly id: number) {}
  async init(): Promise<void> {}
  async bake(recipe: Recipe, input: DataValue): Promise<BakeResult> {
    this.calls.push((input.type === "string" ? input.value : "") + `@${this.id}`);
    await new Promise((r) => setTimeout(r, 5));
    return makeResult(`run-${this.id}`);
  }
  cancelActive(): void {}
  dispose(): void {}
}

describe("WorkerPoolClient", () => {
  it("assigns queued jobs across worker slots", async () => {
    let created = 0;
    const pool = new WorkerPoolClient({
      size: 2,
      clientFactory: () => new FakeClient(created++)
    });

    const recipe: Recipe = { version: 1, steps: [] };
    const p1 = pool.bake(recipe, { type: "string", value: "a" });
    const p2 = pool.bake(recipe, { type: "string", value: "b" });
    const p3 = pool.bake(recipe, { type: "string", value: "c" });
    const out = await Promise.all([p1, p2, p3]);

    expect(out).toHaveLength(3);
    expect(out[0]?.run.workerId).toBeTypeOf("number");
    expect(out[1]?.run.workerId).toBeTypeOf("number");
    expect(out[2]?.run.workerId).toBeTypeOf("number");
    expect(out[2]?.run.queuedMs).toBeGreaterThanOrEqual(0);
  });
});
