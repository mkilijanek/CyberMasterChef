import React from "react";
import type { DataValue, Recipe } from "@cybermasterchef/core";
import { base64ToBytes, bytesToBase64, bytesToUtf8, emptyRecipe, utf8ToBytes } from "@cybermasterchef/core";
import { useTranslation } from "react-i18next";
import { SandboxClient } from "./worker/workerClient";
import { OperationCatalog } from "./components/OperationCatalog";
import { RecipeEditor } from "./components/RecipeEditor";
import { IOPane } from "./components/IOPane";

type Status = "ready" | "working" | "error";
type SharedState = { recipe: Recipe; input: string };

const HASH_PREFIX = "#state=";

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

export function App(): JSX.Element {
  const { t } = useTranslation();
  const initial = React.useMemo(() => loadInitialState(), []);
  const [catalogQuery, setCatalogQuery] = React.useState("");
  const [recipe, setRecipe] = React.useState<Recipe>(initial.recipe);
  const [input, setInput] = React.useState<string>(initial.input);
  const [autoBake, setAutoBake] = React.useState<boolean>(() => {
    const saved = localStorage.getItem("autobake.v1");
    return saved === null ? false : saved === "1";
  });
  const [output, setOutput] = React.useState<string>("");
  const [status, setStatus] = React.useState<Status>("ready");
  const [error, setError] = React.useState<string | null>(null);
  const sandboxRef = React.useRef<SandboxClient | null>(null);
  if (!sandboxRef.current) sandboxRef.current = new SandboxClient();

  React.useEffect(() => {
    localStorage.setItem("recipe.v1", JSON.stringify(recipe));
    localStorage.setItem("input.v1", input);
    localStorage.setItem("autobake.v1", autoBake ? "1" : "0");

    const shared = toBase64Url(JSON.stringify({ recipe, input }));
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${HASH_PREFIX}${shared}`);
  }, [autoBake, input, recipe]);

  const run = React.useCallback(async (): Promise<void> => {
    setStatus("working");
    setError(null);
    try {
      const inVal: DataValue = { type: "string", value: input };
      const res = await sandboxRef.current!.bake(recipe, inVal);
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
      setError(msg);
      setStatus("error");
    }
  }, [input, recipe]);

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
        <button className="buttonSmall" onClick={() => void shareLink()}>
          {t("shareLink")}
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
          <RecipeEditor recipe={recipe} onChange={setRecipe} />
          {error ? (
            <div className="error" role="alert">
              {t("error")}: {error}
            </div>
          ) : null}
        </section>
        <section className="panel">
          <IOPane input={input} output={output} onInputChange={setInput} />
        </section>
      </main>
    </div>
  );
}
