"use client";

import { FormEvent, useState } from "react";

export default function LoginForm({ needsCode }: { needsCode: boolean }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      const res = await fetch("/api/panel/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        window.location.href = "/panel";
        return;
      }
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      setError(json.error ?? "No se ha podido entrar.");
    } catch {
      setError("Sin conexión. Inténtalo de nuevo.");
    }
    setBusy(false);
  };

  return (
    <form className="pn-form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="pn-pass">Contraseña</label>
        <input id="pn-pass" name="password" type="password" autoComplete="current-password" required autoFocus />
      </div>
      {needsCode ? (
        <div className="field">
          <label htmlFor="pn-code">Código de la app de autenticación</label>
          <input id="pn-code" name="code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" placeholder="000000" required />
        </div>
      ) : null}
      <button type="submit" className="pill pill-lime tall" disabled={busy}>
        {busy ? "Comprobando…" : "Entrar"}
      </button>
      <p role="alert" className="form-msg lime">{error}</p>
    </form>
  );
}
