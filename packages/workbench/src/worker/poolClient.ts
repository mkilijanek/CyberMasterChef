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
  private maxQueueDepthObserved = 0;
  private disposed = false;

  constructor(opts?: {
    size?: number;
    maxQueue?: number;
    clientFactory?: () => ExecutionClient;
  }) {
    const size = Math.max(1, Math.floor(opts?.size ?? 2));
    this.maxQueue = Math.max(1, Math.floor(opts?.maxQueue ?? 64));
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
    if (this.disposed) throw new Error("WorkerPoolClient is disposed");
    await this.init();
    const priority = opts?.priority ?? "normal";
    return await new Promise<BakeResult>((resolve, reject) => {
      if (this.queue.length >= this.maxQueue) {
        reject(new Error(`Worker queue limit exceeded (${this.maxQueue})`));
        return;
      }
      const task: QueueTask = {
        id: nextTaskId(),
        recipe,
        input,
        priority,
        enqueuedAt: Date.now(),
        queueDepthAtEnqueue: this.queue.length + 1,
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
            attempt: 1,
            queueDepthAtEnqueue: task.queueDepthAtEnqueue,
            queueDepthAtStart,
            maxQueueDepthObserved: this.maxQueueDepthObserved
          }
        });
      })
      .catch((error) => {
        task.reject(error);
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
