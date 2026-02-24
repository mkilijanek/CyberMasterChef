import React from "react";
import { useTranslation } from "react-i18next";
import { createRegistryWithBuiltins } from "../plugins/builtins";

const registry = createRegistryWithBuiltins();

export function OperationCatalog(props: {
  query: string;
  onAdd: (opId: string) => void;
}): React.JSX.Element {
  const { t } = useTranslation();
  const q = props.query.trim().toLowerCase();
  const ops = registry.list().filter((op) =>
    q
      ? op.name.toLowerCase().includes(q) ||
        op.description.toLowerCase().includes(q) ||
        op.id.toLowerCase().includes(q)
      : true
  );

  return (
    <>
      <div className="muted">{t("matchesCount", { count: ops.length })}</div>
      <ul className="list" aria-label={t("operations")}>
        {ops.length === 0 ? (
          <li className="listItem muted">{t("noOperationsMatch")}</li>
        ) : null}
        {ops.map((op) => (
          <li key={op.id} className="listItem">
            <div className="opTitle">{op.name}</div>
            <div className="opId">{op.id}</div>
            <div className="opDesc">{op.description}</div>
            <button className="buttonSmall" onClick={() => props.onAdd(op.id)}>
              {t("add")}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
