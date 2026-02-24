import type { WorkerRequest } from "./protocol";

function isWorkerRequest(value: unknown): value is WorkerRequest {
  if (typeof value !== "object" || value === null) return false;
  const msg = value as { type?: unknown };
  if (msg.type === "init") return true;
  if (msg.type === "cancel") {
    return typeof (value as { id?: unknown }).id === "string";
  }
  if (msg.type === "bake") {
    const bake = value as {
      id?: unknown;
      recipe?: { version?: unknown; steps?: unknown };
      input?: { type?: unknown; value?: unknown };
      timeoutMs?: unknown;
    };
    if (typeof bake.id !== "string") return false;
    if (typeof bake.recipe !== "object" || bake.recipe === null) return false;
    if (bake.recipe.version !== 1) return false;
    if (!Array.isArray(bake.recipe.steps)) return false;
    if (typeof bake.input !== "object" || bake.input === null) return false;
    if (bake.input.type !== "string" && bake.input.type !== "bytes" && bake.input.type !== "json") {
      return false;
    }
    if (bake.timeoutMs !== undefined && typeof bake.timeoutMs !== "number") return false;
    return true;
  }
  return false;
}

export function isTrustedWorkerMessage(
  ev: MessageEvent<unknown>,
  expectedOrigin: string
): ev is MessageEvent<WorkerRequest> {
  const eventOrigin = typeof ev.origin === "string" ? ev.origin : "";
  // Dedicated worker events often have empty origin; validate explicit origin when provided.
  if (eventOrigin.length > 0 && eventOrigin !== expectedOrigin) return false;
  return isWorkerRequest(ev.data);
}
