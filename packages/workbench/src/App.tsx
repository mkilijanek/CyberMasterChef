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
import { OperationCatalog } from "./components/OperationCatalog";
import { RecipeEditor } from "./components/RecipeEditor";
import { IOPane } from "./components/IOPane";

type Status = "ready" | "working" | "error";
type SharedState = { recipe: Recipe; input: string };
type TraceRow = { step: number; opId: string; inputType: string; outputType: string };

const HASH_PREFIX = "#state=";
const DEFAULT_TIMEOUT_MS = 10_000;
const MIN_TIMEOUT_MS = 100;
const MAX_TIMEOUT_MS = 120_000;

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
  const [recipe, setRecipe] = React.useState<Recipe>(initial.recipe);
  const [input, setInput] = React.useState<string>(initial.input);
  const [autoBake, setAutoBake] = React.useState<boolean>(() => {
    const saved = localStorage.getItem("autobake.v1");
    return saved === null ? false : saved === "1";
  });
  const [timeoutMs, setTimeoutMs] = React.useState<number>(() => {
    const saved = Number(localStorage.getItem("timeoutMs.v1"));
    if (!Number.isFinite(saved)) return DEFAULT_TIMEOUT_MS;
    return Math.min(MAX_TIMEOUT_MS, Math.max(MIN_TIMEOUT_MS, saved));
  });
  const [output, setOutput] = React.useState<string>("");
  const [trace, setTrace] = React.useState<TraceRow[]>([]);
  const [status, setStatus] = React.useState<Status>("ready");
  const [error, setError] = React.useState<string | null>(null);
  const [importWarnings, setImportWarnings] = React.useState<RecipeImportWarning[]>([]);
  const sandboxRef = React.useRef<SandboxClient | null>(null);
  if (!sandboxRef.current) sandboxRef.current = new SandboxClient();

  React.useEffect(() => {
    return () => {
      sandboxRef.current?.dispose();
    };
  }, []);

  React.useEffect(() => {
    localStorage.setItem("recipe.v1", JSON.stringify(recipe));
    localStorage.setItem("input.v1", input);
    localStorage.setItem("autobake.v1", autoBake ? "1" : "0");
    localStorage.setItem("timeoutMs.v1", String(timeoutMs));
    localStorage.setItem("catalogQuery.v1", catalogQuery);

    const shared = toBase64Url(JSON.stringify({ recipe, input }));
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${HASH_PREFIX}${shared}`);
  }, [autoBake, catalogQuery, input, recipe, timeoutMs]);

  const executeRecipe = React.useCallback(async (recipeToRun: Recipe): Promise<void> => {
    sandboxRef.current?.cancelActive();
    setStatus("working");
    setError(null);
    setImportWarnings([]);
    setTrace([]);
    try {
      const inVal: DataValue = { type: "string", value: input };
      const res = await sandboxRef.current!.bake(recipeToRun, inVal, {
        timeoutMs
      });
      setTrace(res.trace);
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
    await executeRecipe(recipe);
  }, [executeRecipe, recipe]);

  const runToStep = React.useCallback(async (stepIndex: number): Promise<void> => {
    if (stepIndex < 0 || stepIndex >= recipe.steps.length) return;
    const partial: Recipe = {
      ...recipe,
      steps: recipe.steps.slice(0, stepIndex + 1)
    };
    await executeRecipe(partial);
  }, [executeRecipe, recipe]);

  React.useEffect(() => {
    if (!autoBake) return;
    const handle = window.setTimeout(() => {
      void run();
    }, 250);
    return () => window.clearTimeout(handle);
  }, [autoBake, input, recipe, run]);

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

  async function copyTrace(): Promise<void> {
    const payload = JSON.stringify(trace, null, 2);
    const copied = await copyText(payload);
    if (!copied) {
      setError(t("copyTraceFailed"));
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
      } catch {
        const imported = importCyberChefRecipe(raw);
        parsed = imported.recipe;
        warnings = imported.warnings;
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
            type="checkbox"
            checked={autoBake}
            onChange={(e) => setAutoBake(e.target.checked)}
          />
          {t("autoBake")}
        </label>
        <button className="button" onClick={() => void run()}>
          {t("run")}
        </button>
        <label className="timeoutControl">
          <span>{t("timeoutMs")}</span>
          <input
            className="timeoutInput"
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
        <button
          className="buttonSmall"
          onClick={() => cancelRun()}
          disabled={status !== "working"}
        >
          {t("cancel")}
        </button>
        <button className="buttonSmall" onClick={() => void shareLink()}>
          {t("shareLink")}
        </button>
        <button className="buttonSmall" onClick={() => void exportNativeRecipe()}>
          {t("exportRecipe")}
        </button>
        <button className="buttonSmall" onClick={() => void exportCyberChef()}>
          {t("exportCyberChef")}
        </button>
        <button className="buttonSmall" onClick={() => importAnyRecipe()}>
          {t("importRecipe")}
        </button>
        <button className="buttonSmall" onClick={() => void copyOutput()}>
          {t("copyOutput")}
        </button>
        <button className="buttonSmall" onClick={() => void copyTrace()}>
          {t("copyTrace")}
        </button>
        <button className="buttonSmall" onClick={() => resetWorkspace()}>
          {t("reset")}
        </button>
        <div className="status" aria-live="polite">
          {status === "working" ? t("statusWorking") : t("statusReady")}
        </div>
      </header>
      <main className="main">
        <section className="panel">
          <h2>{t("operations")}</h2>
          <input
            className="input"
            value={catalogQuery}
            onChange={(e) => setCatalogQuery(e.target.value)}
            placeholder={t("search")}
            aria-label={t("search")}
          />
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
          <div className="traceBox">
            <h3>{t("trace")}</h3>
            {trace.length === 0 ? (
              <div className="muted">{t("traceEmpty")}</div>
            ) : (
              <ol className="traceList">
                {trace.map((row) => (
                  <li key={`${row.step}-${row.opId}`} className="traceItem">
                    <strong>
                      {t("step")} {row.step + 1}
                    </strong>{" "}
                    <code>{row.opId}</code>{" "}
                    <span className="muted">
                      ({row.inputType} -&gt; {row.outputType})
                    </span>
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
