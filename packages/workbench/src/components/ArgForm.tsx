import React from "react";
import type { ArgSpec } from "@cybermasterchef/core";

export function ArgForm(props: {
  specs: ArgSpec[];
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}): React.JSX.Element {
  if (props.specs.length === 0) {
    return <div className="muted">No args</div>;
  }

  function set(key: string, v: unknown): void {
    props.onChange({ ...props.value, [key]: v });
  }

  return (
    <div className="args">
      {props.specs.map((s) => {
        const current = props.value[s.key] ?? s.defaultValue;
        if (s.type === "string") {
          return (
            <label key={s.key} className="argRow">
              <span className="argLabel">{s.label}</span>
              <input
                className="input"
                value={typeof current === "string" ? current : ""}
                onChange={(e) => set(s.key, e.target.value)}
              />
            </label>
          );
        }
        if (s.type === "number") {
          return (
            <label key={s.key} className="argRow">
              <span className="argLabel">{s.label}</span>
              <input
                className="input"
                type="number"
                value={typeof current === "number" ? String(current) : ""}
                onChange={(e) => set(s.key, Number(e.target.value))}
              />
            </label>
          );
        }
        if (s.type === "boolean") {
          return (
            <label key={s.key} className="argRow">
              <span className="argLabel">{s.label}</span>
              <input
                type="checkbox"
                checked={Boolean(current)}
                onChange={(e) => set(s.key, e.target.checked)}
              />
            </label>
          );
        }
        if (s.type === "select") {
          return (
            <label key={s.key} className="argRow">
              <span className="argLabel">{s.label}</span>
              <select
                className="input"
                value={typeof current === "string" ? current : ""}
                onChange={(e) => set(s.key, e.target.value)}
              >
                {(s.options ?? []).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          );
        }
        return (
          <div key={s.key} className="argRow">
            Unsupported arg type: {s.type}
          </div>
        );
      })}
    </div>
  );
}
