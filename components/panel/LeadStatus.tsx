"use client";

import { useState } from "react";

const LABELS: Record<string, string> = { nueva: "Nueva", respondida: "Respondida", cliente: "Cliente", descartada: "Descartada" };

export default function LeadStatus({ id, status }: { id: string; status: string }) {
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const change = async (next: string) => {
    const before = value;
    setValue(next);
    setSaving(true);
    setError(false);
    try {
      const res = await fetch(`/api/panel/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setValue(before);
      setError(true);
    }
    setSaving(false);
  };

  return (
    <span className="pn-status">
      <label className="sr-only" htmlFor={`st-${id}`}>
        Estado
      </label>
      <select id={`st-${id}`} value={value} onChange={(e) => change(e.target.value)} disabled={saving} data-status={value}>
        {Object.entries(LABELS).map(([k, l]) => (
          <option key={k} value={k}>
            {l}
          </option>
        ))}
      </select>
      {error ? <span className="pn-err">No se ha guardado</span> : null}
    </span>
  );
}
