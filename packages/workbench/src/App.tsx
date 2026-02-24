import React from "react";
import type { DataValue, Recipe, RecipeImportWarning } from "@cybermasterchef/core";
import {
  base64ToBytes,
  bytesToBase64,
  bytesToUtf8,
  emptyRecipe,
  exportCyberChefRecipe,
  importCyberChefRecipe,
  parseRecipe,
  stringifyRecipe,
  utf8ToBytes
} from "@cybermasterchef/core";
import { useTranslation } from "react-i18next";
import { SandboxClient } from "./worker/workerClient";
import type { ExecutionClient } from "./worker/clientTypes";
import { WorkerPoolClient } from "./worker/poolClient";
import { OperationCatalog } from "./components/OperationCatalog";
import { RecipeEditor } from "./components/RecipeEditor";
import { IOPane } from "./components/IOPane";

type Status = "ready" | "working" | "error";
type SharedState = { recipe: Recipe; input: string };
type TraceRow = { step: number; opId: string; inputType: string; outputType: string; durationMs: number };
type RunInfo = {
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
};

const HASH_PREFIX = "#state=";
const DEFAULT_TIMEOUT_MS = 10_000;
const MIN_TIMEOUT_MS = 100;
const MAX_TIMEOUT_MS = 120_000;
const DEFAULT_POOL_SIZE = 2;
const MIN_POOL_SIZE = 1;
const MAX_POOL_SIZE = 8;

function isRecipe(value: unknown): value is Recipe {
  if (typeof value !== "object" || value === null) return false;
  const x = value as { version?: unknown; steps?: unknown };
  return x.version === 1 && Array.isArray(x.steps);
}

function toBase64Url(s: string): string {
  const base64 = bytesToBase64(utf8ToBytes(s));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(s: string): string {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  const remainder = padded.length % 4;
  const base64 = remainder === 0 ? padded : padded + "=".repeat(4 - remainder);
  return bytesToUtf8(base64ToBytes(base64));
}

function loadInitialState(): SharedState {
  const hash = window.location.hash;
  if (hash.startsWith(HASH_PREFIX)) {
    try {
      const payload = fromBase64Url(hash.slice(HASH_PREFIX.length));
      const parsed = JSON.parse(payload) as { recipe?: unknown; input?: unknown };
      if (isRecipe(parsed.recipe)) {
        return {
          recipe: parsed.recipe,
          input: typeof parsed.input === "string" ? parsed.input : ""
        };
      }
    } catch {
      // fallback to local storage
    }
  }

  const recipeSaved = localStorage.getItem("recipe.v1");
  const inputSaved = localStorage.getItem("input.v1");
  let recipe = emptyRecipe();
  if (recipeSaved) {
    try {
      const parsed = JSON.parse(recipeSaved) as unknown;
      if (isRecipe(parsed)) recipe = parsed;
    } catch {
      // ignore and use empty recipe
    }
  }
  return { recipe, input: inputSaved ?? "" };
}

export function App(): React.JSX.Element {
  const { t } = useTranslation();
  const initial = React.useMemo(() => loadInitialState(), []);
  const [catalogQuery, setCatalogQuery] = React.useState<string>(
    () => localStorage.getItem("catalogQuery.v1") ?? ""
  );
  const [traceQuery, setTraceQuery] = React.useState<string>(
    () => localStorage.getItem("traceQuery.v1") ?? ""
  );
  const [recipe, setRecipe] = React.useState<Recipe>(initial.recipe);
  const [input, setInput] = React.useState<string>(initial.input);
  const [autoBake, setAutoBake] = React.useState<boolean>(() => {
    const saved = localStorage.getItem("autobake.v1");
    return saved === null ? false : saved === "1";
  });
  const [timeoutMs, setTimeoutMs] = React.useState<number>(() => {
    const raw = localStorage.getItem("timeoutMs.v1");
    if (raw === null) return DEFAULT_TIMEOUT_MS;
    const saved = Number(raw);
    if (!Number.isFinite(saved)) return DEFAULT_TIMEOUT_MS;
    return Math.min(MAX_TIMEOUT_MS, Math.max(MIN_TIMEOUT_MS, saved));
  });
  const [workerPoolSize, setWorkerPoolSize] = React.useState<number>(() => {
    const raw = localStorage.getItem("workerPoolSize.v1");
    const parsed = raw === null ? DEFAULT_POOL_SIZE : Number(raw);
    if (!Number.isFinite(parsed)) return DEFAULT_POOL_SIZE;
    return Math.min(MAX_POOL_SIZE, Math.max(MIN_POOL_SIZE, Math.floor(parsed)));
  });
  const [output, setOutput] = React.useState<string>("");
  const [trace, setTrace] = React.useState<TraceRow[]>([]);
  const [lastRunMs, setLastRunMs] = React.useState<number | null>(null);
  const [lastRunInfo, setLastRunInfo] = React.useState<RunInfo | null>(null);
  const [lastImportSource, setLastImportSource] = React.useState<"native" | "cyberchef" | null>(null);
  const [status, setStatus] = React.useState<Status>("ready");
  const [error, setError] = React.useState<string | null>(null);
  const [importWarnings, setImportWarnings] = React.useState<RecipeImportWarning[]>([]);
  const sandboxRef = React.useRef<ExecutionClient | null>(null);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  const traceSearchInputRef = React.useRef<HTMLInputElement | null>(null);

  function getSandboxClient(): ExecutionClient {
    if (!sandboxRef.current) {
      sandboxRef.current =
        workerPoolSize <= 1
          ? new SandboxClient()
          : new WorkerPoolClient({ size: workerPoolSize });
    }
    return sandboxRef.current;
  }

  React.useEffect(() => {
    getSandboxClient();
    return () => {
      const client = sandboxRef.current;
      sandboxRef.current = null;
      client?.dispose();
    };
  }, [workerPoolSize]);

  React.useEffect(() => {
    localStorage.setItem("recipe.v1", JSON.stringify(recipe));
    localStorage.setItem("input.v1", input);
    localStorage.setItem("autobake.v1", autoBake ? "1" : "0");
    localStorage.setItem("timeoutMs.v1", String(timeoutMs));
    localStorage.setItem("workerPoolSize.v1", String(workerPoolSize));
    localStorage.setItem("catalogQuery.v1", catalogQuery);
    localStorage.setItem("traceQuery.v1", traceQuery);

    const shared = toBase64Url(JSON.stringify({ recipe, input }));
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${HASH_PREFIX}${shared}`);
  }, [autoBake, catalogQuery, input, recipe, timeoutMs, traceQuery, workerPoolSize]);

  const filteredTrace = React.useMemo(() => {
    const q = traceQuery.trim().toLowerCase();
    if (!q) return trace;
    return trace.filter(
      (row) =>
        row.opId.toLowerCase().includes(q) ||
        row.inputType.toLowerCase().includes(q) ||
        row.outputType.toLowerCase().includes(q)
    );
  }, [trace, traceQuery]);

  const executeRecipe = React.useCallback(async (
    recipeToRun: Recipe,
    priority: "normal" | "high" = "high"
  ): Promise<void> => {
    sandboxRef.current?.cancelActive();
    setStatus("working");
    setError(null);
    setImportWarnings([]);
    setLastImportSource(null);
    setTrace([]);
    setLastRunMs(null);
    setLastRunInfo(null);
    const startedAt = performance.now();
    try {
      const inVal: DataValue = { type: "string", value: input };
      const res = await getSandboxClient().bake(recipeToRun, inVal, {
        timeoutMs,
        priority
      });
      setTrace(res.trace);
      setLastRunMs(Math.round(performance.now() - startedAt));
      setLastRunInfo(res.run);
      if (res.output.type === "bytes") {
        const hex = [...res.output.value]
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        setOutput(hex);
      } else if (res.output.type === "json") {
        setOutput(JSON.stringify(res.output.value, null, 2));
      } else {
        setOutput(String(res.output.value));
      }
      setStatus("ready");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === "Aborted") {
        setError(t("runCancelled"));
        setStatus("ready");
        return;
      }
      setError(msg);
      setStatus("error");
    }
  }, [input, t, timeoutMs]);

  const run = React.useCallback(async (): Promise<void> => {
    await executeRecipe(recipe, "high");
  }, [executeRecipe, recipe]);

  const runToStep = React.useCallback(async (stepIndex: number): Promise<void> => {
    if (stepIndex < 0 || stepIndex >= recipe.steps.length) return;
    const partial: Recipe = {
      ...recipe,
      steps: recipe.steps.slice(0, stepIndex + 1)
    };
    await executeRecipe(partial, "high");
  }, [executeRecipe, recipe]);

  React.useEffect(() => {
    if (!autoBake) return;
    const handle = window.setTimeout(() => {
      void executeRecipe(recipe, "normal");
    }, 250);
    return () => window.clearTimeout(handle);
  }, [autoBake, executeRecipe, input, recipe]);

  React.useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape" && status === "working") {
        ev.preventDefault();
        cancelRun();
      }
      if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") {
        ev.preventDefault();
        void run();
      }
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "k") {
        ev.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      if ((ev.ctrlKey || ev.metaKey) && ev.shiftKey && ev.key.toLowerCase() === "k") {
        ev.preventDefault();
        traceSearchInputRef.current?.focus();
        traceSearchInputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [run, status]);

  async function shareLink(): Promise<void> {
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      setError(t("shareFailed"));
      setStatus("error");
    }
  }

  async function copyOutput(): Promise<void> {
    const copied = await copyText(output);
    if (!copied) {
      setError(t("copyOutputFailed"));
      setStatus("error");
    }
  }

  async function copyInput(): Promise<void> {
    const copied = await copyText(input);
    if (!copied) {
      setError(t("copyInputFailed"));
      setStatus("error");
    }
  }

  async function copyTrace(): Promise<void> {
    const payload = JSON.stringify(trace, null, 2);
    const copied = await copyText(payload);
    if (!copied) {
      setError(t("copyTraceFailed"));
      setStatus("error");
    }
  }

  async function copyFilteredTrace(): Promise<void> {
    const payload = JSON.stringify(filteredTrace, null, 2);
    const copied = await copyText(payload);
    if (!copied) {
      setError(t("copyFilteredTraceFailed"));
      setStatus("error");
    }
  }

  async function copyTraceSummary(): Promise<void> {
    if (!lastRunInfo) {
      setError(t("traceSummaryMissing"));
      setStatus("error");
      return;
    }
    const summary = {
      runId: lastRunInfo.runId,
      durationMs: lastRunInfo.durationMs,
      traceSteps: trace.length,
      stepDurationTotalMs: lastRunInfo.stepDurationTotalMs,
      stepDurationAvgMs: lastRunInfo.stepDurationAvgMs,
      slowestStep: lastRunInfo.slowestStep,
      queuedMs: lastRunInfo.queuedMs ?? null,
      workerId: lastRunInfo.workerId ?? null
    };
    const copied = await copyText(JSON.stringify(summary, null, 2));
    if (!copied) {
      setError(t("copyTraceSummaryFailed"));
      setStatus("error");
    }
  }

  async function copyRecipeJson(): Promise<void> {
    const payload = stringifyRecipe(recipe);
    const copied = await copyText(payload);
    if (!copied) {
      setError(t("copyRecipeFailed"));
      setStatus("error");
    }
  }

  async function copyReproBundle(): Promise<void> {
    if (!lastRunInfo) {
      setError(t("reproMissingRun"));
      setStatus("error");
      return;
    }
    const bundle = {
      run: lastRunInfo,
      recipe,
      input,
      trace,
      outputType: output.length > 0 ? "text" : "empty"
    };
    const payload = JSON.stringify(bundle, null, 2);
    const copied = await copyText(payload);
    if (!copied) {
      setError(t("copyReproFailed"));
      setStatus("error");
    }
  }

  function resetWorkspace(): void {
    if (!window.confirm(t("resetConfirm"))) return;
    setRecipe(emptyRecipe());
    setInput("");
    setOutput("");
    setTrace([]);
    setImportWarnings([]);
    setError(null);
    setStatus("ready");
  }

  function clearTrace(): void {
    setTrace([]);
    setTraceQuery("");
    setLastRunMs(null);
    setLastRunInfo(null);
  }

  function cancelRun(): void {
    sandboxRef.current?.cancelActive();
  }

  async function copyText(value: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      return false;
    }
  }

  async function exportNativeRecipe(): Promise<void> {
    const payload = stringifyRecipe(recipe);
    const copied = await copyText(payload);
    if (!copied) {
      window.prompt(t("copyPrompt"), payload);
    }
  }

  async function exportCyberChef(): Promise<void> {
    const payload = exportCyberChefRecipe(recipe);
    const copied = await copyText(payload);
    if (!copied) {
      window.prompt(t("copyPrompt"), payload);
    }
  }

  function importAnyRecipe(): void {
    const raw = window.prompt(t("importPrompt"), "");
    if (!raw) return;
    try {
      let parsed: Recipe;
      let warnings: RecipeImportWarning[] = [];
      try {
        parsed = parseRecipe(raw);
        setLastImportSource("native");
      } catch {
        const imported = importCyberChefRecipe(raw);
        parsed = imported.recipe;
        warnings = imported.warnings;
        setLastImportSource("cyberchef");
      }
      setRecipe(parsed);
      setImportWarnings(warnings);
      if (warnings.length > 0) {
        setError(null);
        setStatus("ready");
      } else {
        setError(null);
        setStatus("ready");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`${t("importFailed")}: ${msg}`);
      setStatus("error");
    }
  }

  return (
    <div className="layout">
      <header className="header">
        <h1>{t("title")}</h1>
        <label className="toggle">
          <input
            data-testid="autobake-toggle"
            type="checkbox"
            checked={autoBake}
            onChange={(e) => setAutoBake(e.target.checked)}
          />
          {t("autoBake")}
        </label>
        <button className="button" data-testid="run-button" onClick={() => void run()}>
          {t("run")}
        </button>
        <label className="timeoutControl">
          <span>{t("timeoutMs")}</span>
          <input
            className="timeoutInput"
            data-testid="timeout-input"
            type="number"
            min={MIN_TIMEOUT_MS}
            max={MAX_TIMEOUT_MS}
            step={100}
            value={timeoutMs}
            onChange={(e) => {
              const raw = Number(e.target.value);
              if (!Number.isFinite(raw)) return;
              setTimeoutMs(Math.min(MAX_TIMEOUT_MS, Math.max(MIN_TIMEOUT_MS, raw)));
            }}
            onBlur={() => {
              setTimeoutMs((v) => Math.min(MAX_TIMEOUT_MS, Math.max(MIN_TIMEOUT_MS, v)));
            }}
          />
          <span className="muted">{t("timeoutRange")}</span>
        </label>
        <label className="timeoutControl">
          <span>{t("workerPoolSize")}</span>
          <input
            className="timeoutInput"
            data-testid="pool-size-input"
            type="number"
            min={MIN_POOL_SIZE}
            max={MAX_POOL_SIZE}
            step={1}
            value={workerPoolSize}
            onChange={(e) => {
              const raw = Number(e.target.value);
              if (!Number.isFinite(raw)) return;
              setWorkerPoolSize(Math.min(MAX_POOL_SIZE, Math.max(MIN_POOL_SIZE, Math.floor(raw))));
            }}
            onBlur={() => {
              setWorkerPoolSize((v) => Math.min(MAX_POOL_SIZE, Math.max(MIN_POOL_SIZE, v)));
            }}
          />
          <span className="muted">{t("workerPoolSizeRange")}</span>
        </label>
        <button
          className="buttonSmall"
          onClick={() => cancelRun()}
          disabled={status !== "working"}
        >
          {t("cancel")}
        </button>
        <button className="buttonSmall" data-testid="share-link-button" onClick={() => void shareLink()}>
          {t("shareLink")}
        </button>
        <button className="buttonSmall" onClick={() => void exportNativeRecipe()}>
          {t("exportRecipe")}
        </button>
        <button className="buttonSmall" onClick={() => void exportCyberChef()}>
          {t("exportCyberChef")}
        </button>
        <button className="buttonSmall" data-testid="import-recipe-button" onClick={() => importAnyRecipe()}>
          {t("importRecipe")}
        </button>
        <button className="buttonSmall" onClick={() => void copyOutput()}>
          {t("copyOutput")}
        </button>
        <button className="buttonSmall" onClick={() => void copyInput()}>
          {t("copyInput")}
        </button>
        <button className="buttonSmall" onClick={() => void copyTrace()}>
          {t("copyTrace")}
        </button>
        <button className="buttonSmall" onClick={() => void copyFilteredTrace()}>
          {t("copyFilteredTrace")}
        </button>
        <button className="buttonSmall" onClick={() => void copyTraceSummary()}>
          {t("copyTraceSummary")}
        </button>
        <button className="buttonSmall" onClick={() => void copyRecipeJson()}>
          {t("copyRecipe")}
        </button>
        <button className="buttonSmall" data-testid="copy-repro-button" onClick={() => void copyReproBundle()}>
          {t("copyRepro")}
        </button>
        <button className="buttonSmall" onClick={() => clearTrace()}>
          {t("clearTrace")}
        </button>
        <button className="buttonSmall" onClick={() => resetWorkspace()}>
          {t("reset")}
        </button>
        <div className="traceCount">
          {t("traceSteps")}: {trace.length}
        </div>
        <div className="traceCount">
          {t("runDurationMs")}: {lastRunMs ?? "-"}
        </div>
        <div className="traceCount">
          {t("traceDurationTotalMs")}: {lastRunInfo ? Math.round(lastRunInfo.stepDurationTotalMs) : "-"}
        </div>
        <div className="traceCount">
          {t("traceDurationAvgMs")}: {lastRunInfo ? Math.round(lastRunInfo.stepDurationAvgMs) : "-"}
        </div>
        <div className="traceCount">
          {t("slowestStepLabel")}:{" "}
          {lastRunInfo?.slowestStep
            ? `${lastRunInfo.slowestStep.step + 1} (${lastRunInfo.slowestStep.opId}, ${lastRunInfo.slowestStep.durationMs} ms)`
            : "-"}
        </div>
        <div className="traceCount">
          {t("runId")}: {lastRunInfo ? lastRunInfo.runId.slice(0, 8) : "-"}
        </div>
        <div className="traceCount">
          {t("queueWaitMs")}: {lastRunInfo?.queuedMs ?? "-"}
        </div>
        <div className="traceCount">
          {t("workerIdLabel")}: {lastRunInfo?.workerId ?? "-"}
        </div>
        <div className="traceCount">
          {t("attemptLabel")}: {lastRunInfo?.attempt ?? "-"}
        </div>
        <div className="traceCount">
          {t("recipeHashShort")}: {lastRunInfo ? lastRunInfo.recipeHash.slice(0, 12) : "-"}
        </div>
        <div className="traceCount">
          {t("inputHashShort")}: {lastRunInfo ? lastRunInfo.inputHash.slice(0, 12) : "-"}
        </div>
        <div className="status" aria-live="polite">
          {status === "working" ? t("statusWorking") : t("statusReady")}
        </div>
      </header>
      <main className="main">
        <section className="panel">
          <h2>{t("operations")}</h2>
          <input
            ref={searchInputRef}
            data-testid="catalog-search-input"
            className="input"
            value={catalogQuery}
            onChange={(e) => setCatalogQuery(e.target.value)}
            placeholder={t("search")}
            aria-label={t("search")}
          />
          <button className="buttonSmall" onClick={() => setCatalogQuery("")}>
            {t("clearSearch")}
          </button>
          <OperationCatalog
            query={catalogQuery}
            onAdd={(opId) => {
              setRecipe((r) => ({
                ...r,
                steps: [...r.steps, { opId, args: {} }]
              }));
            }}
          />
        </section>
        <section className="panel">
          <h2>{t("recipe")}</h2>
          <RecipeEditor recipe={recipe} onChange={setRecipe} onRunToStep={(i) => void runToStep(i)} />
          {error ? (
            <div className="error" role="alert">
              {t("error")}: {error}
            </div>
          ) : null}
          {importWarnings.length > 0 ? (
            <div className="warning" role="status" aria-live="polite">
              <strong>{t("importWarnings", { count: importWarnings.length })}</strong>
              <ul className="warningList">
                {importWarnings.map((w) => (
                  <li key={`${w.step}-${w.op}`}>
                    {t("step")} {w.step + 1}: <code>{w.op}</code> ({w.reason})
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {lastImportSource ? (
            <div className="muted">
              {t("lastImportSource")}:{" "}
              {lastImportSource === "cyberchef"
                ? t("importSourceCyberChef")
                : t("importSourceNative")}
            </div>
          ) : null}
          <div className="traceBox">
            <h3>{t("trace")}</h3>
            <input
              ref={traceSearchInputRef}
              data-testid="trace-search-input"
              className="input"
              value={traceQuery}
              onChange={(e) => setTraceQuery(e.target.value)}
              placeholder={t("traceSearch")}
              aria-label={t("traceSearch")}
            />
            <button className="buttonSmall" onClick={() => setTraceQuery("")}>
              {t("clearTraceSearch")}
            </button>
            <div className="muted">
              {t("traceFilteredCount", { visible: filteredTrace.length, total: trace.length })}
            </div>
            {trace.length === 0 ? (
              <div className="muted">{t("traceEmpty")}</div>
            ) : filteredTrace.length === 0 ? (
              <div className="muted">{t("noTraceMatch")}</div>
            ) : (
              <ol className="traceList">
                {filteredTrace.map((row) => (
                  <li key={`${row.step}-${row.opId}`} className="traceItem">
                    <strong>
                      {t("step")} {row.step + 1}
                    </strong>{" "}
                    <code>{row.opId}</code>{" "}
                    <span className="muted">
                      ({row.inputType} -&gt; {row.outputType}, {row.durationMs} ms)
                    </span>
                    <button
                      className="buttonSmall traceButton"
                      onClick={() => void runToStep(row.step)}
                    >
                      {t("runToStep")}
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
        <section className="panel">
          <IOPane input={input} output={output} onInputChange={setInput} />
        </section>
      </main>
    </div>
  );
}
