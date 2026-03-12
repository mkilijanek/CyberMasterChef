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

class ControlledClient implements ExecutionClient {
  public readonly order: string[] = [];
  public readonly cancelledTaskIds: string[] = [];
  private releaseCurrent: (() => void) | null = null;
  async init(): Promise<void> {}
  async bake(recipe: Recipe, input: DataValue): Promise<BakeResult> {
    const marker = input.type === "string" ? input.value : "";
    this.order.push(marker);
    await new Promise<void>((resolve) => {
      this.releaseCurrent = resolve;
    });
    return makeResult(`run-${marker}`);
  }
  release(): void {
    this.releaseCurrent?.();
    this.releaseCurrent = null;
  }
  cancelActive(taskId?: string): void {
    if (taskId) this.cancelledTaskIds.push(taskId);
  }
  dispose(): void {}
}

class FlakyClient implements ExecutionClient {
  private calls = 0;
  async init(): Promise<void> {}
  bake(): Promise<BakeResult> {
    this.calls++;
    if (this.calls === 1) {
      return Promise.reject(new Error("Transient failure"));
    }
    return Promise.resolve(makeResult("flaky-ok"));
  }
  cancelActive(): void {}
  dispose(): void {}
}

class RejectingClient implements ExecutionClient {
  async init(): Promise<void> {}
  bake(): Promise<BakeResult> {
    return Promise.reject(new Error("Aborted"));
  }
  cancelActive(): void {}
  dispose(): void {}
}

class CountingInitClient implements ExecutionClient {
  public initCalls = 0;
  async init(): Promise<void> {
    this.initCalls += 1;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  bake(): Promise<BakeResult> {
    return Promise.resolve(makeResult("init-ok"));
  }
  cancelActive(): void {}
  dispose(): void {}
}

class RetryCapacityClient implements ExecutionClient {
  public releaseBlocker: (() => void) | null = null;
  private retried = false;
  async init(): Promise<void> {}
  async bake(_recipe: Recipe, input: DataValue): Promise<BakeResult> {
    const marker = input.type === "string" ? input.value : "";
    if (marker === "retry" && !this.retried) {
      this.retried = true;
      throw new Error("Transient failure");
    }
    if (marker === "blocker") {
      await new Promise<void>((resolve) => {
        this.releaseBlocker = resolve;
      });
    }
    return makeResult(`run-${marker}`);
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
    expect(out[0]?.run.queueDepthAtEnqueue).toBeGreaterThanOrEqual(1);
    expect(out[1]?.run.queueDepthAtEnqueue).toBeGreaterThanOrEqual(1);
    expect(out[2]?.run.queueDepthAtStart).toBeGreaterThanOrEqual(0);
    expect(out[2]?.run.maxQueueDepthObserved).toBeGreaterThanOrEqual(1);
    expect(out[2]?.run.inFlightAtStart).toBeGreaterThanOrEqual(0);
  });

  it("prefers high-priority jobs over queued normal jobs", async () => {
    const controlled = new ControlledClient();
    const pool = new WorkerPoolClient({
      size: 1,
      clientFactory: () => controlled
    });
    const recipe: Recipe = { version: 1, steps: [] };

    const first = pool.bake(recipe, { type: "string", value: "first" }, { priority: "normal" });
    const second = pool.bake(recipe, { type: "string", value: "second" }, { priority: "normal" });
    const third = pool.bake(recipe, { type: "string", value: "third" }, { priority: "high" });

    await new Promise((r) => setTimeout(r, 5));
    controlled.release();
    await new Promise((r) => setTimeout(r, 5));
    controlled.release();
    await new Promise((r) => setTimeout(r, 5));
    controlled.release();

    await Promise.all([first, second, third]);
    expect(controlled.order).toEqual(["first", "third", "second"]);
  });

  it("cancels queued jobs when cancelActive is invoked", async () => {
    const controlled = new ControlledClient();
    const pool = new WorkerPoolClient({
      size: 1,
      clientFactory: () => controlled
    });
    const recipe: Recipe = { version: 1, steps: [] };

    const running = pool.bake(recipe, { type: "string", value: "running" }, { priority: "normal" });
    const queued = pool.bake(recipe, { type: "string", value: "queued" }, { priority: "normal" });

    await new Promise((r) => setTimeout(r, 5));
    pool.cancelActive();
    controlled.release();

    await expect(queued).rejects.toThrow("Cancelled queued task:");
    await expect(running).resolves.toBeTruthy();
  });

  it("cancels only the targeted active task instead of every slot", async () => {
    const first = new ControlledClient();
    const second = new ControlledClient();
    let created = 0;
    const pool = new WorkerPoolClient({
      size: 2,
      clientFactory: () => (created++ === 0 ? first : second)
    });
    const recipe: Recipe = { version: 1, steps: [] };

    const runningA = await pool.enqueue(recipe, { type: "string", value: "running-a" });
    const runningB = await pool.enqueue(recipe, { type: "string", value: "running-b" });

    await new Promise((r) => setTimeout(r, 5));
    pool.cancelActive(runningA.taskId);

    expect(first.cancelledTaskIds).toEqual([runningA.taskId]);
    expect(second.cancelledTaskIds).toEqual([]);

    first.release();
    second.release();
    await expect(runningA.result).resolves.toBeTruthy();
    await expect(runningB.result).resolves.toBeTruthy();
  });

  it("rejects enqueue when queue limit is exceeded", async () => {
    const controlled = new ControlledClient();
    const pool = new WorkerPoolClient({
      size: 1,
      maxQueue: 1,
      clientFactory: () => controlled
    });
    const recipe: Recipe = { version: 1, steps: [] };

    const running = pool.bake(recipe, { type: "string", value: "running" });
    const queued = pool.bake(recipe, { type: "string", value: "queued" });
    const overflow = pool.bake(recipe, { type: "string", value: "overflow" });

    await expect(overflow).rejects.toThrow("Worker queue limit exceeded (1)");
    controlled.release();
    await new Promise((r) => setTimeout(r, 5));
    controlled.release();
    await expect(Promise.all([running, queued])).resolves.toBeTruthy();
  });

  it("handles overflow and queued cancel in one scenario", async () => {
    const controlled = new ControlledClient();
    const pool = new WorkerPoolClient({
      size: 1,
      maxQueue: 1,
      clientFactory: () => controlled
    });
    const recipe: Recipe = { version: 1, steps: [] };

    const running = pool.bake(recipe, { type: "string", value: "running" });
    const queued = pool.bake(recipe, { type: "string", value: "queued" });
    const overflow = pool.bake(recipe, { type: "string", value: "overflow" });

    await expect(overflow).rejects.toThrow("Worker queue limit exceeded (1)");
    pool.cancelActive();
    controlled.release();
    await expect(queued).rejects.toThrow("Cancelled queued task:");
    await expect(running).resolves.toBeTruthy();
  });

  it("supports canceling a specific queued task by id", async () => {
    const controlled = new ControlledClient();
    const pool = new WorkerPoolClient({
      size: 1,
      clientFactory: () => controlled
    });
    const recipe: Recipe = { version: 1, steps: [] };

    const running = await pool.enqueue(recipe, { type: "string", value: "running" });
    const queued = await pool.enqueue(recipe, { type: "string", value: "queued" });
    const cancelled = pool.cancelQueued(queued.taskId);

    expect(cancelled).toBe(true);
    controlled.release();
    await expect(queued.result).rejects.toThrow(`Cancelled queued task: ${queued.taskId}`);
    await expect(running.result).resolves.toBeTruthy();
  });

  it("retries transient failures when maxAttempts > 1", async () => {
    const pool = new WorkerPoolClient({
      size: 1,
      maxAttempts: 2,
      clientFactory: () => new FlakyClient(),
      shouldRetry: () => true
    });
    const recipe: Recipe = { version: 1, steps: [] };
    const out = await pool.bake(recipe, { type: "string", value: "x" });
    expect(out.output.type).toBe("string");
    expect(out.output.value).toBe("flaky-ok");
    expect(out.run.attempt).toBe(2);
  });

  it("schedules retry with backoff delay", async () => {
    const delays: number[] = [];
    const pool = new WorkerPoolClient({
      size: 1,
      maxAttempts: 2,
      clientFactory: () => new FlakyClient(),
      shouldRetry: () => true,
      retryBaseDelayMs: 10,
      retryMaxDelayMs: 10,
      retryJitterRatio: 0,
      scheduleRetry: (fn, delayMs) => {
        delays.push(delayMs);
        setTimeout(fn, 0);
      }
    });
    const recipe: Recipe = { version: 1, steps: [] };
    const out = await pool.bake(recipe, { type: "string", value: "x" });
    expect(out.run.attempt).toBe(2);
    expect(delays).toEqual([10]);
  });

  it("rejects retry when queue is already at capacity", async () => {
    const retryCallbacks: Array<() => void> = [];
    const client = new RetryCapacityClient();
    const pool = new WorkerPoolClient({
      size: 1,
      maxQueue: 1,
      maxAttempts: 2,
      clientFactory: () => client,
      shouldRetry: () => true,
      scheduleRetry: (fn) => {
        retryCallbacks.push(fn);
      }
    });
    const recipe: Recipe = { version: 1, steps: [] };

    const retrying = pool.bake(recipe, { type: "string", value: "retry" });
    await new Promise((resolve) => setTimeout(resolve, 5));
    const blocking = pool.bake(recipe, { type: "string", value: "blocker" });
    const queued = pool.bake(recipe, { type: "string", value: "queued" });

    await new Promise((resolve) => setTimeout(resolve, 5));
    retryCallbacks[0]?.();

    await expect(retrying).rejects.toThrow("Worker queue limit exceeded (1) during retry");
    client.releaseBlocker?.();
    await expect(blocking).resolves.toBeTruthy();
    await expect(queued).resolves.toBeTruthy();
  });

  it("reports stats, dispose rejects queued work, and init rejects after dispose", async () => {
    const controlled = new ControlledClient();
    const pool = new WorkerPoolClient({
      size: 1,
      clientFactory: () => controlled
    });
    const recipe: Recipe = { version: 1, steps: [] };

    const running = await pool.enqueue(recipe, { type: "string", value: "running" });
    const queued = await pool.enqueue(recipe, { type: "string", value: "queued" });

    expect(pool.getStats()).toMatchObject({
      queueDepth: 1,
      inFlight: 1,
      maxQueue: 64
    });
    expect(pool.cancelQueued("missing-task")).toBe(false);

    pool.dispose();
    controlled.release();

    await expect(queued.result).rejects.toThrow("Worker pool disposed");
    await expect(running.result).resolves.toBeTruthy();
    await expect(pool.init()).rejects.toThrow("WorkerPoolClient is disposed");
  });

  it("deduplicates concurrent init calls across enqueue requests", async () => {
    const client = new CountingInitClient();
    const pool = new WorkerPoolClient({
      size: 1,
      clientFactory: () => client
    });
    const recipe: Recipe = { version: 1, steps: [] };

    const first = pool.enqueue(recipe, { type: "string", value: "a" });
    const second = pool.enqueue(recipe, { type: "string", value: "b" });
    const third = pool.enqueue(recipe, { type: "string", value: "c" });

    await Promise.all([first, second, third]);
    expect(client.initCalls).toBe(1);
  });

  it("does not retry aborted errors when retry policy rejects them", async () => {
    const pool = new WorkerPoolClient({
      size: 1,
      maxAttempts: 2,
      clientFactory: () => new RejectingClient()
    });
    const recipe: Recipe = { version: 1, steps: [] };
    await expect(pool.bake(recipe, { type: "string", value: "x" })).rejects.toThrow("Aborted");
  });
});
