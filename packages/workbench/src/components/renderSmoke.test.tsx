import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import "../i18n";
import { App } from "../App";
import { ArgForm } from "./ArgForm";
import { IOPane } from "./IOPane";
import { OperationCatalog } from "./OperationCatalog";
import { RecipeEditor } from "./RecipeEditor";

describe("workbench render smoke", () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => void storage.set(key, value)
    });
    vi.stubGlobal("window", {
      location: { hash: "", pathname: "/", search: "" },
      history: { replaceState: vi.fn() },
      setInterval: vi.fn(() => 1),
      clearInterval: vi.fn()
    });
  });

  it("renders major UI components", () => {
    const argHtml = renderToStaticMarkup(
      <ArgForm
        specs={[
          { key: "s", label: "Text", type: "string", defaultValue: "a" },
          { key: "n", label: "Num", type: "number", defaultValue: 1 },
          { key: "b", label: "Bool", type: "boolean", defaultValue: true },
          {
            key: "sel",
            label: "Select",
            type: "select",
            defaultValue: "x",
            options: [{ label: "X", value: "x" }]
          }
        ]}
        value={{}}
        onChange={() => undefined}
      />
    );
    const ioHtml = renderToStaticMarkup(
      <IOPane input="in" output="out" onInputChange={() => undefined} />
    );
    const catalogHtml = renderToStaticMarkup(
      <OperationCatalog query="hex" onAdd={() => undefined} />
    );
    const editorHtml = renderToStaticMarkup(
      <RecipeEditor
        recipe={{ version: 1, steps: [{ opId: "codec.toHex" }] }}
        onChange={() => undefined}
      />
    );
    const appHtml = renderToStaticMarkup(<App />);

    expect(argHtml).toContain("Text");
    expect(ioHtml).toContain("textarea");
    expect(catalogHtml).toContain("hex");
    expect(editorHtml).toContain("To Hex");
    expect(appHtml.length).toBeGreaterThan(0);
  });
});
