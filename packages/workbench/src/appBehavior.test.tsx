/* eslint-disable @typescript-eslint/no-unsafe-call */
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, create } from "react-test-renderer";
import "./i18n";
import i18n from "./i18n";

type BakeResult = {
  output: { type: "string" | "bytes" | "json"; value: string | Uint8Array | Record<string, unknown> };
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

const clipboardWriteText = vi.fn<(value: string) => Promise<void>>();
const confirmMock = vi.fn<(message?: string) => boolean>();
const promptMock = vi.fn<(message?: string, defaultValue?: string) => string | null>();
const addEventListenerMock = vi.fn<(type: string, cb: EventListenerOrEventListenerObject) => void>();
const removeEventListenerMock = vi.fn<(type: string, cb: EventListenerOrEventListenerObject) => void>();
const replaceStateMock = vi.fn();
const localStorageState = new Map<string, string>();
const intervalCallbacks: Array<() => void> = [];
const bakeMock = vi.fn<() => Promise<BakeResult>>();
const cancelActiveMock = vi.fn();
const disposeMock = vi.fn();
const getStatsMock = vi.fn();

vi.mock("./worker/workerClient", () => {
  class SandboxClient {
    bake = bakeMock;
    cancelActive = cancelActiveMock;
    dispose = disposeMock;
  }
  return { SandboxClient };
});

vi.mock("./worker/poolClient", () => {
  class WorkerPoolClient {
    bake = bakeMock;
    cancelActive = cancelActiveMock;
    dispose = disposeMock;
    getStats = getStatsMock;
  }
  return { WorkerPoolClient };
});

import { App, toBase64Url } from "./App";

function makeBakeResult(overrides?: Partial<BakeResult>): BakeResult {
  return {
    output: { type: "string", value: "rendered-output" },
    trace: [{ step: 0, opId: "codec.toHex", inputType: "string", outputType: "string", durationMs: 12 }],
    run: {
      runId: "run-12345678",
      startedAt: 1000,
      endedAt: 1012,
      durationMs: 12,
      stepDurationTotalMs: 12,
      stepDurationAvgMs: 12,
      slowestStep: { step: 0, opId: "codec.toHex", durationMs: 12 },
      recipeHash: "recipehash1234567890",
      inputHash: "inputhash1234567890",
      queuedMs: 2,
      workerId: 7,
      attempt: 1,
      queueDepthAtEnqueue: 4,
      queueDepthAtStart: 1,
      maxQueueDepthObserved: 4,
      inFlightAtStart: 1,
      queueOverflowCount: 0
    },
    ...overrides
  };
}

function flattenText(children: unknown): string {
  if (children === null || children === undefined || typeof children === "boolean") return "";
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map((child) => flattenText(child)).join("");
  if (typeof children === "object" && children !== null && "children" in children) {
    return flattenText((children as { children?: unknown }).children);
  }
  return "";
}

function findButton(root: ReturnType<typeof create>, label: string) {
  return root.root.find(
    (node) => node.type === "button" && flattenText(node.props.children).trim() === label
  );
}

function findButtons(root: ReturnType<typeof create>, label: string) {
  return root.root.findAll(
    (node) => node.type === "button" && flattenText(node.props.children).trim() === label
  );
}

function findByTestId(root: ReturnType<typeof create>, testId: string) {
  return root.root.find((node) => node.props["data-testid"] === testId);
}

async function flushPromises(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("App behavior", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    await i18n.changeLanguage("en");
    localStorageState.clear();
    intervalCallbacks.length = 0;
    clipboardWriteText.mockReset();
    confirmMock.mockReset();
    promptMock.mockReset();
    addEventListenerMock.mockReset();
    removeEventListenerMock.mockReset();
    replaceStateMock.mockReset();
    bakeMock.mockReset();
    cancelActiveMock.mockReset();
    disposeMock.mockReset();
    getStatsMock.mockReset();
    clipboardWriteText.mockResolvedValue(undefined);
    confirmMock.mockReturnValue(true);
    promptMock.mockReturnValue(null);
    getStatsMock.mockReturnValue({
      queueDepth: 0,
      inFlight: 0,
      maxQueue: 64,
      maxQueueDepthObserved: 0,
      queueOverflowCount: 0
    });

    vi.stubGlobal("localStorage", {
      getItem: (key: string) => localStorageState.get(key) ?? null,
      setItem: (key: string, value: string) => void localStorageState.set(key, value)
    });
    vi.stubGlobal("navigator", {
      clipboard: { writeText: clipboardWriteText }
    });
    vi.stubGlobal("window", {
      location: {
        hash: "",
        pathname: "/",
        search: "",
        origin: "http://localhost"
      },
      history: { replaceState: replaceStateMock },
      localStorage,
      navigator,
      confirm: confirmMock,
      prompt: promptMock,
      addEventListener: addEventListenerMock.mockImplementation((type, cb) => {
        if (type === "keydown") {
          intervalCallbacks.push(() => {
            if (typeof cb === "function") {
              cb({
                key: "Escape",
                ctrlKey: false,
                metaKey: false,
                shiftKey: false,
                preventDefault: vi.fn()
              } as unknown as KeyboardEvent);
            }
          });
        }
      }),
      removeEventListener: removeEventListenerMock,
      setTimeout,
      clearTimeout,
      setInterval: vi.fn((cb: () => void) => {
        intervalCallbacks.push(cb);
        return intervalCallbacks.length;
      }),
      clearInterval: vi.fn()
    });
  });

  it("runs recipes, copies artifacts, and supports run-to-step", async () => {
    localStorageState.set("recipe.v1", JSON.stringify({ version: 1, steps: [{ opId: "codec.toHex" }] }));
    bakeMock
      .mockResolvedValueOnce(makeBakeResult())
      .mockResolvedValueOnce(
        makeBakeResult({
          output: { type: "bytes", value: new Uint8Array([0xde, 0xad, 0xbe, 0xef]) }
        })
      );

    let root!: ReturnType<typeof create>;
    await act(async () => {
      root = create(<App />);
      await flushPromises();
    });

    await act(() => {
      findByTestId(root, "run-button").props.onClick();
      return flushPromises();
    });

    expect(bakeMock).toHaveBeenCalledTimes(1);
    expect(root.toJSON()).toBeTruthy();
    expect(findByTestId(root, "io-output").props.value).toBe("rendered-output");

    await act(() => {
      findButton(root, "Copy output").props.onClick();
      findButton(root, "Copy input").props.onClick();
      findButton(root, "Copy trace").props.onClick();
      findButton(root, "Copy filtered trace").props.onClick();
      findButton(root, "Copy trace summary").props.onClick();
      findByTestId(root, "copy-repro-button").props.onClick();
      return flushPromises();
    });

    expect(clipboardWriteText).toHaveBeenCalled();

    await act(() => {
      const runToStepButton = findButtons(root, "Run to step").find(
        (node) => node.props.className === "buttonSmall traceButton"
      );
      runToStepButton?.props.onClick();
      return flushPromises();
    });
    expect(bakeMock).toHaveBeenCalledTimes(2);
    expect(findByTestId(root, "io-output").props.value).toBe("deadbeef");

    await act(() => {
      findButton(root, "Clear trace").props.onClick();
      return Promise.resolve();
    });
    expect(flattenText(root.toJSON())).toContain("No execution trace yet");
  });

  it("handles share/import/export/reset error flows", async () => {
    bakeMock.mockResolvedValue(makeBakeResult());
    clipboardWriteText.mockRejectedValueOnce(new Error("copy-failed"));
    clipboardWriteText.mockRejectedValueOnce(new Error("copy-failed"));
    promptMock
      .mockReturnValueOnce("not-json")
      .mockReturnValueOnce(JSON.stringify({ version: 1, steps: [{ opId: "codec.toHex" }] }))
      .mockReturnValueOnce("manual-copy")
      .mockReturnValueOnce("manual-copy");

    let root!: ReturnType<typeof create>;
    await act(async () => {
      root = create(<App />);
      await flushPromises();
    });

    await act(() => {
      findByTestId(root, "share-link-button").props.onClick();
      return flushPromises();
    });
    expect(flattenText(root.toJSON())).toContain("Error: Could not copy link");

    await act(() => {
      findByTestId(root, "import-recipe-button").props.onClick();
      return Promise.resolve();
    });
    expect(flattenText(root.toJSON())).toContain("Import failed");

    await act(() => {
      findByTestId(root, "import-recipe-button").props.onClick();
      return Promise.resolve();
    });
    expect(flattenText(root.toJSON())).toContain("Last import source: Native");

    await act(() => {
      findButton(root, "Export recipe").props.onClick();
      findButton(root, "Export CyberChef").props.onClick();
      return flushPromises();
    });
    expect(promptMock).toHaveBeenCalled();

    await act(() => {
      findButton(root, "Reset").props.onClick();
      return Promise.resolve();
    });
    expect(confirmMock).toHaveBeenCalled();
    expect(flattenText(root.toJSON())).toContain("No execution trace yet");
  });

  it("autobakes with worker-pool stats and keyboard cancellation", async () => {
    localStorageState.set("autobake.v1", "1");
    localStorageState.set("workerPoolSize.v1", "3");
    localStorageState.set("workerMaxQueue.v1", "4");
    const recipe = { version: 1, steps: [{ opId: "codec.toHex" }] };
    localStorageState.set("recipe.v1", JSON.stringify(recipe));
    localStorageState.set("input.v1", "queued-input");
    getStatsMock.mockReturnValue({
      queueDepth: 4,
      inFlight: 1,
      maxQueue: 4,
      maxQueueDepthObserved: 4,
      queueOverflowCount: 2
    });
    let resolveBake: ((value: BakeResult) => void) | null = null;
    bakeMock.mockImplementation(
      () =>
        new Promise<BakeResult>((resolve) => {
          resolveBake = resolve;
        })
    );

    let root!: ReturnType<typeof create>;
    await act(() => {
      root = create(<App />);
      return flushPromises();
    });
    await act(() => {
      vi.advanceTimersByTime(300);
      return flushPromises();
    });

    expect(bakeMock).toHaveBeenCalledTimes(1);

    await act(() => {
      for (const cb of intervalCallbacks) cb();
      return flushPromises();
    });

    expect(flattenText(root.toJSON())).toContain("Queue saturation warning");

    const keydownHandler = addEventListenerMock.mock.calls.find((call) => call[0] === "keydown")?.[1];
    expect(keydownHandler).toBeDefined();
    await act(() => {
      if (typeof keydownHandler === "function") {
        keydownHandler({
          key: "Escape",
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          preventDefault: vi.fn()
        } as unknown as KeyboardEvent);
      }
      return flushPromises();
    });
    expect(cancelActiveMock).toHaveBeenCalled();

    await act(() => {
      resolveBake?.(makeBakeResult());
      return flushPromises();
    });
  });

  it("loads shared hash state into the app", async () => {
    const recipe = { version: 1, steps: [{ opId: "codec.toHex" }] };
    window.location.hash = `#state=${toBase64Url(JSON.stringify({ recipe, input: "hash-input" }))}`;
    bakeMock.mockResolvedValue(makeBakeResult());

    let root!: ReturnType<typeof create>;
    await act(async () => {
      root = create(<App />);
      await flushPromises();
    });

    expect(findByTestId(root, "io-input").props.value).toBe("hash-input");
  });

  it("copies recipe JSON and manages catalog and trace search filters", async () => {
    localStorageState.set("recipe.v1", JSON.stringify({ version: 1, steps: [{ opId: "codec.toHex" }] }));
    bakeMock.mockResolvedValue(makeBakeResult());

    let root!: ReturnType<typeof create>;
    await act(async () => {
      root = create(<App />);
      await flushPromises();
    });

    await act(() => {
      findByTestId(root, "run-button").props.onClick();
      return flushPromises();
    });

    await act(() => {
      findButton(root, "Copy recipe").props.onClick();
      return flushPromises();
    });
    expect(clipboardWriteText).toHaveBeenCalledWith(
      JSON.stringify({ version: 1, steps: [{ opId: "codec.toHex" }] }, null, 2)
    );

    await act(() => {
      findByTestId(root, "catalog-search-input").props.onChange({
        target: { value: "hex" }
      } as React.ChangeEvent<HTMLInputElement>);
      return Promise.resolve();
    });
    expect(localStorageState.get("catalogQuery.v1")).toBe("hex");

    await act(() => {
      const clearSearchButton = findButtons(root, "Clear search")[0];
      if (!clearSearchButton) throw new Error("Clear search button not found");
      clearSearchButton.props.onClick();
      return Promise.resolve();
    });
    expect(localStorageState.get("catalogQuery.v1")).toBe("");

    await act(() => {
      findByTestId(root, "trace-search-input").props.onChange({
        target: { value: "no-match" }
      } as React.ChangeEvent<HTMLInputElement>);
      return Promise.resolve();
    });
    expect(flattenText(root.toJSON())).toContain("No trace rows match this filter");

    await act(() => {
      const clearTraceSearchButton = findButtons(root, "Clear trace filter")[0];
      if (!clearTraceSearchButton) throw new Error("Clear trace filter button not found");
      clearTraceSearchButton.props.onClick();
      return Promise.resolve();
    });
    expect(localStorageState.get("traceQuery.v1")).toBe("");
    expect(flattenText(root.toJSON())).not.toContain("No trace rows match this filter");
  });

  it("imports CyberChef recipes with warnings", async () => {
    promptMock.mockReturnValueOnce(
      JSON.stringify({
        recipe: [
          { op: "To Hex", args: [] },
          { op: "Unsupported Thing", args: [] }
        ]
      })
    );

    let root!: ReturnType<typeof create>;
    await act(async () => {
      root = create(<App />);
      await flushPromises();
    });

    await act(() => {
      findByTestId(root, "import-recipe-button").props.onClick();
      return Promise.resolve();
    });

    const rendered = flattenText(root.toJSON());
    expect(rendered).toContain("Imported with 1 unsupported step(s) skipped");
    expect(rendered).toContain("Last import source: CyberChef");
    expect(rendered).toContain("Unsupported Thing");
  });
});
