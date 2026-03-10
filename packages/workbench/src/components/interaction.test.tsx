/* eslint-disable @typescript-eslint/no-unsafe-call */
import React from "react";
import { describe, expect, it } from "vitest";
import type { ReactTestInstance } from "react-test-renderer";
import { act, create } from "react-test-renderer";
import "../i18n";
import { ArgForm } from "./ArgForm";
import { IOPane } from "./IOPane";
import { OperationCatalog } from "./OperationCatalog";
import { RecipeEditor } from "./RecipeEditor";

describe("component interactions", () => {
  it("updates ArgForm values through all control types", () => {
    let nextValue: Record<string, unknown> | null = null;
    let root!: ReturnType<typeof create>;
    act(() => {
      root = create(
        <ArgForm
          specs={[
            { key: "s", label: "S", type: "string", defaultValue: "x" },
            { key: "n", label: "N", type: "number", defaultValue: 1 },
            { key: "b", label: "B", type: "boolean", defaultValue: false },
            {
              key: "sel",
              label: "Sel",
              type: "select",
              defaultValue: "a",
              options: [
                { label: "A", value: "a" },
                { label: "B", value: "b" }
              ]
            }
          ]}
          value={{}}
          onChange={(value) => {
            nextValue = value;
          }}
        />
      );
    });

    const inputs = root.root.findAllByType("input");
    const select = root.root.findByType("select");

    act(() => {
      inputs[0]?.props.onChange({ target: { value: "hello" } });
    });
    expect(nextValue).toEqual({ s: "hello" });

    act(() => {
      inputs[1]?.props.onChange({ target: { value: "7" } });
    });
    expect(nextValue).toEqual({ n: 7 });

    act(() => {
      inputs[2]?.props.onChange({ target: { checked: true } });
    });
    expect(nextValue).toEqual({ b: true });

    act(() => {
      select.props.onChange({ target: { value: "b" } });
    });
    expect(nextValue).toEqual({ sel: "b" });
  });

  it("updates IO pane and recipe editor actions", () => {
    let inputValue = "";
    let ioRoot!: ReturnType<typeof create>;
    act(() => {
      ioRoot = create(
        <IOPane input="in" output="out" onInputChange={(value) => {
          inputValue = value;
        }} />
      );
    });
    const textareas = ioRoot.root.findAllByType("textarea");
    act(() => {
      textareas[0]?.props.onChange({ target: { value: "changed" } });
    });
    expect(inputValue).toBe("changed");

    const changes: Array<{ version: 1; steps: Array<{ opId: string; args?: Record<string, unknown> }> }> = [];
    const runToSteps: number[] = [];
    let recipeRoot!: ReturnType<typeof create>;
    act(() => {
      recipeRoot = create(
        <RecipeEditor
          recipe={{
            version: 1,
            steps: [
              { opId: "codec.toHex" },
              { opId: "text.replace", args: { find: "a", replace: "b", all: true } }
            ]
          }}
          onChange={(recipe) => {
            changes.push(recipe);
          }}
          onRunToStep={(index) => {
            runToSteps.push(index);
          }}
        />
      );
    });

    const buttons = recipeRoot.root.findAllByType("button");
    act(() => {
      buttons[0]?.props.onClick();
    });
    act(() => {
      buttons[2]?.props.onClick();
      buttons[3]?.props.onClick();
      buttons[4]?.props.onClick();
      buttons[5]?.props.onClick();
      buttons[6]?.props.onClick();
    });

    expect(changes.length).toBeGreaterThan(0);
    expect(runToSteps).toContain(0);
  });

  it("updates selected recipe args and ignores invalid move directions", () => {
    const changes: Array<{ version: 1; steps: Array<{ opId: string; args?: Record<string, unknown> }> }> = [];
    let root!: ReturnType<typeof create>;
    act(() => {
      root = create(
        <RecipeEditor
          recipe={{
            version: 1,
            steps: [{ opId: "text.replace", args: { find: "a", replace: "b", all: false } }]
          }}
          onChange={(recipe) => {
            changes.push(recipe);
          }}
        />
      );
    });

    const buttons = root.root.findAllByType("button");
    act(() => {
      buttons[0]?.props.onClick();
    });

    const inputs = root.root.findAllByType("input");
    act(() => {
      inputs[0]?.props.onChange({ target: { value: "needle" } });
      inputs[1]?.props.onChange({ target: { value: "replacement" } });
      inputs[2]?.props.onChange({ target: { checked: true } });
    });

    act(() => {
      buttons[1]?.props.onClick();
      buttons[2]?.props.onClick();
    });

    expect(changes.some((recipe) => recipe.steps[0]?.args?.find === "needle")).toBe(true);
    expect(changes.some((recipe) => recipe.steps[0]?.args?.replace === "replacement")).toBe(true);
    expect(changes.some((recipe) => recipe.steps[0]?.args?.all === true)).toBe(true);
  });

  it("renders catalog matches and add handler", () => {
    const added: string[] = [];
    let root!: ReturnType<typeof create>;
    act(() => {
      root = create(<OperationCatalog query="hex" onAdd={(opId) => added.push(opId)} />);
    });
    const addButtons = root.root.findAll(
      (node: ReactTestInstance) =>
        node.type === "button" && node.props.className === "buttonSmall"
    );

    expect(addButtons.length).toBeGreaterThan(0);
    act(() => {
      addButtons[0]?.props.onClick();
    });
    expect(added[0]).toBeTypeOf("string");
  });
});
