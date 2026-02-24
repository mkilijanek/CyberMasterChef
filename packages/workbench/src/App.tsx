import React from "react";
import type { DataValue, Recipe } from "@cybermasterchef/core";
import { emptyRecipe } from "@cybermasterchef/core";
import { useTranslation } from "react-i18next";
import { SandboxClient } from "./worker/workerClient";
import { OperationCatalog } from "./components/OperationCatalog";
import { RecipeEditor } from "./components/RecipeEditor";
import { IOPane } from "./components/IOPane";

type Status = "ready" | "working" | "error";

export function App(): JSX.Element {
  const { t } = useTranslation();
  const [catalogQuery, setCatalogQuery] = React.useState("");
  const [recipe, setRecipe] = React.useState<Recipe>(() => {
    const saved = localStorage.getItem("recipe.v1");
    if (!saved) return emptyRecipe();
    try {
      return JSON.parse(saved) as Recipe;
    } catch {
      return emptyRecipe();
    }
  });
  const [input, setInput] = React.useState<string>("");
  const [output, setOutput] = React.useState<string>("");
  const [status, setStatus] = React.useState<Status>("ready");
  const [error, setError] = React.useState<string | null>(null);
  const sandboxRef = React.useRef<SandboxClient | null>(null);
  if (!sandboxRef.current) sandboxRef.current = new SandboxClient();

  React.useEffect(() => {
    localStorage.setItem("recipe.v1", JSON.stringify(recipe));
  }, [recipe]);

  async function run(): Promise<void> {
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
  }

  return (
    <div className="layout">
      <header className="header">
        <h1>{t("title")}</h1>
        <button className="button" onClick={() => void run()}>
          {t("run")}
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
