import React from "react";
import { useTranslation } from "react-i18next";

export function IOPane(props: {
  input: string;
  output: string;
  outputMeta?: {
    outputType: string;
    charLength: number;
    byteLength: number | null;
    mediaType: string | null;
  } | null;
  outputPreviewSrc?: string | null;
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
        {props.outputMeta ? (
          <div className="muted" data-testid="io-output-meta">
            {t("outputTypeLabel")}: {props.outputMeta.outputType} | {t("outputCharsLabel")}:{" "}
            {props.outputMeta.charLength}
            {props.outputMeta.byteLength !== null
              ? ` | ${t("outputBytesLabel")}: ${props.outputMeta.byteLength}`
              : ""}
            {props.outputMeta.mediaType !== null
              ? ` | ${t("outputMediaLabel")}: ${props.outputMeta.mediaType}`
              : ""}
          </div>
        ) : null}
        <textarea data-testid="io-output" className="textarea" value={props.output} readOnly />
        {props.outputPreviewSrc ? (
          <div className="ioPreview">
            <span className="ioTitle">{t("outputPreview")}</span>
            <img
              data-testid="io-output-preview"
              className="ioPreviewImage"
              src={props.outputPreviewSrc}
              alt={t("outputPreview")}
            />
          </div>
        ) : null}
      </label>
    </div>
  );
}
