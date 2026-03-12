import { describe, expect, it } from "vitest";
import { isCancellationError } from "./cancellation";

describe("isCancellationError", () => {
  it("recognizes active and queued cancellation messages", () => {
    expect(isCancellationError(new Error("Aborted"))).toBe(true);
    expect(isCancellationError(new Error("Cancelled while waiting in queue"))).toBe(true);
    expect(isCancellationError(new Error("Cancelled queued task: abc"))).toBe(true);
  });

  it("does not treat unrelated failures as cancellation", () => {
    expect(isCancellationError(new Error("boom"))).toBe(false);
  });
});
