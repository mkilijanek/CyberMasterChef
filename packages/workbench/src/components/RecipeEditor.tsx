import React from "react";
import type { Recipe } from "@cybermasterchef/core";
import { useTranslation } from "react-i18next";
import { createRegistryWithBuiltins } from "../plugins/builtins";
import { ArgForm } from "./ArgForm";

const registry = createRegistryWithBuiltins();

export function RecipeEditor(props: {
  recipe: Recipe;
  onChange: (r: Recipe) => void;
  onRunToStep?: (stepIndex: number) => void;
}): React.JSX.Element {
  const { t } = useTranslation();
  const [selected, setSelected] = React.useState<number | null>(null);

  function move(i: number, dir: -1 | 1): void {
    const j = i + dir;
    if (j < 0 || j >= props.recipe.steps.length) return;
    const steps = [...props.recipe.steps];
    const tmp = steps[i];
    steps[i] = steps[j]!;
    steps[j] = tmp!;
    props.onChange({ ...props.recipe, steps });
    setSelected(j);
  }

  function remove(i: number): void {
    const steps = props.recipe.steps.filter((_, idx) => idx !== i);
    props.onChange({ ...props.recipe, steps });
    setSelected(null);
  }

  function duplicate(i: number): void {
    const source = props.recipe.steps[i];
    if (!source) return;
    const copy = source.args
      ? { ...source, args: { ...source.args } }
      : { ...source };
    const steps = [
      ...props.recipe.steps.slice(0, i + 1),
      copy,
      ...props.recipe.steps.slice(i + 1)
    ];
    props.onChange({ ...props.recipe, steps });
    setSelected(i + 1);
  }

  function setArgs(i: number, args: Record<string, unknown>): void {
    const steps = props.recipe.steps.map((s, idx) =>
      idx === i ? { ...s, args } : s
    );
    props.onChange({ ...props.recipe, steps });
  }

  return (
    <div className="recipe">
      <ol className="recipeList">
        {props.recipe.steps.map((s, i) => {
          const op = registry.get(s.opId);
          const label = op ? op.name : s.opId;
          return (
            <li key={`${s.opId}-${i}`} className={selected === i ? "step selected" : "step"}>
              <button
                className="link"
                onClick={() => setSelected(i)}
                aria-label={`Select ${label}`}
              >
                {label}
              </button>
              <div className="stepActions">
                <button
                  className="buttonSmall"
                  onClick={() => move(i, -1)}
                  aria-label={t("moveUp")}
                >
                  {t("moveUp")}
                </button>
                <button
                  className="buttonSmall"
                  onClick={() => move(i, 1)}
                  aria-label={t("moveDown")}
                >
                  {t("moveDown")}
                </button>
                <button
                  className="buttonSmall"
                  onClick={() => remove(i)}
                  aria-label={t("remove")}
                >
                  {t("remove")}
                </button>
                <button
                  className="buttonSmall"
                  onClick={() => duplicate(i)}
                  aria-label={t("duplicate")}
                >
                  {t("duplicate")}
                </button>
                <button
                  className="buttonSmall"
                  onClick={() => props.onRunToStep?.(i)}
                  aria-label={t("runToStep")}
                  data-testid={`recipe-run-to-step-${i}`}
                >
                  {t("runToStep")}
                </button>
              </div>
              {selected === i && op ? (
                <div className="argsBox">
                  <h3>{t("args")}</h3>
                  <ArgForm
                    specs={op.args}
                    value={s.args ?? {}}
                    onChange={(a) => setArgs(i, a)}
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
