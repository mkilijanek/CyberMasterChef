import React from "react";
import { useTranslation } from "react-i18next";

export function IOPane(props: {
  input: string;
  output: string;
  onInputChange: (v: string) => void;
}): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="io">
      <label className="ioBlock">
        <span className="ioTitle">{t("input")}</span>
        <textarea
          data-testid="io-input"
          className="textarea"
          value={props.input}
          onChange={(e) => props.onInputChange(e.target.value)}
        />
      </label>
      <label className="ioBlock">
        <span className="ioTitle">{t("output")}</span>
        <textarea data-testid="io-output" className="textarea" value={props.output} readOnly />
      </label>
    </div>
  );
}
