"use client";

import { useState } from "react";

export function ReportButton({ month }: { month: string }) {
  const [state, setState] = useState<"idle" | "busy" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  const send = async () => {
    setState("busy");
    const res = await fetch("/api/panel/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month }),
    }).catch(() => null);
    const json = (await res?.json().catch(() => ({}))) as { error?: string } | undefined;
    if (res?.ok) {
      setState("ok");
      setMsg("Enviado a tu correo");
    } else {
      setState("error");
      setMsg(json?.error ?? "No se ha podido enviar");
    }
  };
  return (
    <span className="pn-action">
      <button type="button" className="pn-btn" onClick={send} disabled={state === "busy"}>
        {state === "busy" ? "Enviando…" : "Enviarme el informe"}
      </button>
      {msg ? (
        <span className={state === "ok" ? "pn-ok" : "pn-err"} role="status">
          {msg}
        </span>
      ) : null}
    </span>
  );
}

export function LogoutButton() {
  const out = async () => {
    await fetch("/api/panel/logout", { method: "POST" }).catch(() => null);
    window.location.href = "/panel/login";
  };
  return (
    <button type="button" className="pn-btn pn-btn-ghost" onClick={out}>
      Cerrar sesión
    </button>
  );
}

export function PrintButton({ label = "Descargar PDF" }: { label?: string }) {
  return (
    <button type="button" className="pn-btn" onClick={() => window.print()}>
      {label}
    </button>
  );
}
