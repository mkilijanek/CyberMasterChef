import { describe, expect, it } from "vitest";
import type { WorkerRequest } from "./protocol";
import { isTrustedWorkerMessage } from "./messageTrust";

function makeEvent(data: unknown, origin: string): MessageEvent<unknown> {
  return { data, origin } as MessageEvent<unknown>;
}

describe("isTrustedWorkerMessage", () => {
  const expectedOrigin = "https://example.test";

  it("accepts valid worker requests with empty origin", () => {
    const request: WorkerRequest = { type: "init" };
    const ev = makeEvent(request, "");
    expect(isTrustedWorkerMessage(ev, expectedOrigin)).toBe(true);
  });

  it("rejects messages from unexpected origin", () => {
    const request: WorkerRequest = { type: "init" };
    const ev = makeEvent(request, "https://evil.example");
    expect(isTrustedWorkerMessage(ev, expectedOrigin)).toBe(false);
  });

  it("rejects invalid request shape", () => {
    const ev = makeEvent({ type: "bake", id: "x" }, expectedOrigin);
    expect(isTrustedWorkerMessage(ev, expectedOrigin)).toBe(false);
  });

  it("rejects bake requests with non-finite timeout", () => {
    const ev = makeEvent(
      {
        type: "bake",
        id: "x",
        recipe: { version: 1, steps: [] },
        input: { type: "string", value: "abc" },
        timeoutMs: Number.POSITIVE_INFINITY
      },
      expectedOrigin
    );
    expect(isTrustedWorkerMessage(ev, expectedOrigin)).toBe(false);
  });
});
