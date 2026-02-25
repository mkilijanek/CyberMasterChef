export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let i = 0;
  let inQuotes = false;

  while (i < text.length) {
    const ch = text[i];
    const next = i + 1 < text.length ? text[i + 1] : "";

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 2;
        continue;
      }
      if (ch === '"') {
        inQuotes = false;
        i += 1;
        continue;
      }
      cell += ch;
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }

    if (ch === ',') {
      row.push(cell);
      cell = "";
      i += 1;
      continue;
    }

    if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      i += 1;
      continue;
    }

    if (ch === '\r') {
      i += 1;
      continue;
    }

    cell += ch;
    i += 1;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  if (rows.length === 0) return [];
  const header = rows[0];
  const out = [];
  for (let r = 1; r < rows.length; r++) {
    const source = rows[r];
    if (!source || source.every((x) => x.trim().length === 0)) continue;
    const record = {};
    for (let c = 0; c < header.length; c++) {
      record[header[c]] = source[c] ?? "";
    }
    out.push(record);
  }
  return out;
}

export function toCsv(records, columns) {
  const escapeCell = (value) => {
    const raw = String(value ?? "");
    if (/[,"\n\r]/.test(raw)) {
      return `"${raw.replace(/"/g, '""')}"`;
    }
    return raw;
  };

  const lines = [columns.join(",")];
  for (const record of records) {
    const row = columns.map((c) => escapeCell(record[c]));
    lines.push(row.join(","));
  }
  return `${lines.join("\n")}\n`;
}
