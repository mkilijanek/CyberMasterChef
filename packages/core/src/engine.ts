import type { DataValue, OperationRegistry, Recipe } from "./types.js";
import { OperationNotFoundError, OperationRuntimeError } from "./errors.js";
import { coerce, coerceToAnyOf } from "./conversion.js";

export type EngineResult = {
  output: DataValue;
  trace: Array<{
    step: number;
    opId: string;
    inputType: string;
    outputType: string;
  }>;
};

export async function runRecipe(opts: {
  registry: OperationRegistry;
  recipe: Recipe;
  input: DataValue;
  signal?: AbortSignal;
}): Promise<EngineResult> {
  const { registry, recipe, signal } = opts;
  let current = opts.input;
  const trace: EngineResult["trace"] = [];

  for (let i = 0; i < recipe.steps.length; i++) {
    if (signal?.aborted) {
      throw new OperationRuntimeError("engine", "Aborted");
    }
    const step = recipe.steps[i];
    if (!step) continue;
    const op = registry.get(step.opId);
    if (!op) throw new OperationNotFoundError(step.opId);

    const coercedIn = coerceToAnyOf(current, op.input);
    try {
      const ctx =
        signal === undefined
          ? { input: coercedIn, args: step.args ?? {} }
          : { input: coercedIn, args: step.args ?? {}, signal };
      const out = await op.run(ctx);
      const coercedOut = coerce(out, op.output);
      trace.push({
        step: i,
        opId: op.id,
        inputType: coercedIn.type,
        outputType: coercedOut.type
      });
      current = coercedOut;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new OperationRuntimeError(op.id, msg);
    }
  }

  return { output: current, trace };
}
