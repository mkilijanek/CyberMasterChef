import type { DataValue, OperationRegistry, Recipe } from "@cybermasterchef/core";
import type { WorkerRequest, WorkerResponse } from "./protocol";

type TraceRow = Array<{ step: number; opId: string; inputType: string; outputType: string }>;

type RunRecipeResult = { output: DataValue; trace: TraceRow };

type RunRecipeFn = (args: {
  registry: OperationRegistry;
  recipe: Recipe;
  input: DataValue;
  signal?: AbortSignal;
}) => Promise<RunRecipeResult>;

type RuntimeDeps = {
  registry: OperationRegistry;
  runRecipe: RunRecipeFn;
  postMessage: (msg: WorkerResponse, transfer?: Transferable[]) => void;
  setTimeoutFn: (handler: () => void, ms: number) => ReturnType<typeof setTimeout>;
  clearTimeoutFn: (id: ReturnType<typeof setTimeout>) => void;
};

export function createWorkerRuntime(deps: RuntimeDeps): {
  handle: (msg: WorkerRequest) => Promise<void>;
} {
  const activeRuns = new Map<string, AbortController>();

  async function handle(msg: WorkerRequest): Promise<void> {
    if (msg.type === "init") {
      deps.postMessage({ type: "ready" });
      return;
    }

    if (msg.type === "bake") {
      const controller = new AbortController();
      activeRuns.set(msg.id, controller);
      const timeoutMs =
        typeof msg.timeoutMs === "number" && Number.isFinite(msg.timeoutMs) && msg.timeoutMs > 0
          ? msg.timeoutMs
          : 0;
      const timeoutHandle =
        timeoutMs > 0
          ? deps.setTimeoutFn(() => {
              controller.abort();
            }, timeoutMs)
          : null;
      try {
        const res = await deps.runRecipe({
          registry: deps.registry,
          recipe: msg.recipe,
          input: msg.input,
          signal: controller.signal
        });
        if (res.output.type === "bytes") {
          deps.postMessage(
            {
              type: "result",
              id: msg.id,
              output: res.output,
              trace: res.trace
            },
            [res.output.value.buffer]
          );
        } else {
          deps.postMessage({
            type: "result",
            id: msg.id,
            output: res.output,
            trace: res.trace
          });
        }
      } catch (e) {
        deps.postMessage({
          type: "error",
          id: msg.id,
          message: e instanceof Error ? e.message : String(e)
        });
      } finally {
        if (timeoutHandle !== null) deps.clearTimeoutFn(timeoutHandle);
        activeRuns.delete(msg.id);
      }
      return;
    }

    if (msg.type === "cancel") {
      activeRuns.get(msg.id)?.abort();
    }
  }

  return { handle };
}

