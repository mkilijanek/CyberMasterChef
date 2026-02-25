import type { DataValue, Recipe } from "@cybermasterchef/core";
import type { BakeResult, ExecutionClient } from "./clientTypes";
import { SandboxClient } from "./workerClient";

type QueueTask = {
  id: string;
  recipe: Recipe;
  input: DataValue;
  timeoutMs?: number;
  priority: "normal" | "high";
  enqueuedAt: number;
  queueDepthAtEnqueue: number;
  attempt: number;
  resolve: (value: BakeResult) => void;
  reject: (reason?: unknown) => void;
};

type WorkerSlot = {
  id: number;
  busy: boolean;
  client: ExecutionClient;
  activeTaskId: string | null;
};

function nextTaskId(): string {
  return crypto.randomUUID();
}

export class WorkerPoolClient implements ExecutionClient {
  private readonly slots: WorkerSlot[];
  private readonly queue: QueueTask[] = [];
  private readonly maxQueue: number;
  private readonly maxAttempts: number;
  private readonly shouldRetry: (error: unknown) => boolean;
  private maxQueueDepthObserved = 0;
  private queueOverflowCount = 0;
  private disposed = false;

  constructor(opts?: {
    size?: number;
    maxQueue?: number;
    maxAttempts?: number;
    shouldRetry?: (error: unknown) => boolean;
    clientFactory?: () => ExecutionClient;
  }) {
    const size = Math.max(1, Math.floor(opts?.size ?? 2));
    this.maxQueue = Math.max(1, Math.floor(opts?.maxQueue ?? 64));
    this.maxAttempts = Math.max(1, Math.floor(opts?.maxAttempts ?? 1));
    this.shouldRetry =
      opts?.shouldRetry ??
      ((error) => {
        const msg = error instanceof Error ? error.message : String(error);
        return !/aborted|cancel|disposed|queue limit/i.test(msg);
      });
    const clientFactory = opts?.clientFactory ?? (() => new SandboxClient());
    this.slots = Array.from({ length: size }, (_, index) => ({
      id: index,
      busy: false,
      client: clientFactory(),
      activeTaskId: null
    }));
  }

  async init(): Promise<void> {
    if (this.disposed) throw new Error("WorkerPoolClient is disposed");
    await Promise.all(this.slots.map((s) => s.client.init()));
  }

  async bake(
    recipe: Recipe,
    input: DataValue,
    opts?: { timeoutMs?: number; priority?: "normal" | "high" }
  ): Promise<BakeResult> {
    return (await this.enqueue(recipe, input, opts)).result;
  }

  async enqueue(
    recipe: Recipe,
    input: DataValue,
    opts?: { timeoutMs?: number; priority?: "normal" | "high" }
  ): Promise<{ taskId: string; result: Promise<BakeResult> }> {
    if (this.disposed) throw new Error("WorkerPoolClient is disposed");
    await this.init();
    const priority = opts?.priority ?? "normal";
    const taskId = nextTaskId();
    const result = new Promise<BakeResult>((resolve, reject) => {
      if (this.queue.length >= this.maxQueue) {
        this.queueOverflowCount++;
        reject(new Error(`Worker queue limit exceeded (${this.maxQueue})`));
        return;
      }
      const task: QueueTask = {
        id: taskId,
        recipe,
        input,
        priority,
        enqueuedAt: Date.now(),
        queueDepthAtEnqueue: this.queue.length + 1,
        attempt: 1,
        resolve,
        reject
      };
      if (opts?.timeoutMs !== undefined) task.timeoutMs = opts.timeoutMs;
      if (priority === "high") {
        this.queue.unshift(task);
      } else {
        this.queue.push(task);
      }
      this.maxQueueDepthObserved = Math.max(this.maxQueueDepthObserved, this.queue.length);
      this.pumpQueue();
    });
    return { taskId, result };
  }

  cancelActive(): void {
    for (const slot of this.slots) {
      if (slot.busy) slot.client.cancelActive();
    }
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      task?.reject(new Error("Cancelled while waiting in queue"));
    }
  }

  cancelQueued(taskId: string): boolean {
    const idx = this.queue.findIndex((q) => q.id === taskId);
    if (idx < 0) return false;
    const [task] = this.queue.splice(idx, 1);
    task?.reject(new Error(`Cancelled queued task: ${taskId}`));
    return true;
  }

  getStats(): {
    queueDepth: number;
    inFlight: number;
    maxQueue: number;
    maxQueueDepthObserved: number;
    queueOverflowCount: number;
  } {
    return {
      queueDepth: this.queue.length,
      inFlight: this.slots.filter((s) => s.busy).length,
      maxQueue: this.maxQueue,
      maxQueueDepthObserved: this.maxQueueDepthObserved,
      queueOverflowCount: this.queueOverflowCount
    };
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const slot of this.slots) {
      slot.client.dispose();
    }
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      task?.reject(new Error("Worker pool disposed"));
    }
  }

  private pumpQueue(): void {
    if (this.disposed) return;
    const available = this.slots.find((s) => !s.busy);
    if (!available) return;
    const task = this.queue.shift();
    if (!task) return;

    const inFlightAtStart = this.slots.filter((s) => s.busy).length;
    available.busy = true;
    available.activeTaskId = task.id;
    const startedAt = Date.now();
    const queueDepthAtStart = this.queue.length;

    void available.client
      .bake(
        task.recipe,
        task.input,
        task.timeoutMs === undefined ? undefined : { timeoutMs: task.timeoutMs }
      )
      .then((result) => {
        task.resolve({
          ...result,
          run: {
            ...result.run,
            queuedMs: Math.max(0, startedAt - task.enqueuedAt),
            workerId: available.id,
            attempt: task.attempt,
            queueDepthAtEnqueue: task.queueDepthAtEnqueue,
            queueDepthAtStart,
            maxQueueDepthObserved: this.maxQueueDepthObserved,
            inFlightAtStart,
            queueOverflowCount: this.queueOverflowCount
          }
        });
      })
      .catch((error) => {
        if (task.attempt < this.maxAttempts && this.shouldRetry(error)) {
          const retryTask: QueueTask = {
            ...task,
            attempt: task.attempt + 1
          };
          this.queue.unshift(retryTask);
          this.maxQueueDepthObserved = Math.max(this.maxQueueDepthObserved, this.queue.length);
        } else {
          task.reject(error);
        }
      })
      .finally(() => {
        available.busy = false;
        available.activeTaskId = null;
        this.pumpQueue();
      });

    if (this.queue.length > 0 && this.slots.some((s) => !s.busy)) {
      this.pumpQueue();
    }
  }
}
