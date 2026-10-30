"use client";

import { useEffect, useState } from "react";

const KEY = "mate-intro-visto";

// Pantalla de carga: el punto lima respira mientras sube el contador.
// Solo se ve la primera vez en cada visita; al volver a la portada no se repite.
export default function Intro() {
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState<"loading" | "leaving" | "gone">("loading");

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* sin almacenamiento: se muestra igual */
    }
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("gone");
      return;
    }
    // Basado en el tiempo real: dura lo mismo aunque el equipo vaya cargado
    const start = performance.now();
    const id = window.setInterval(() => setPct(Math.min(100, Math.round(((performance.now() - start) / 900) * 100))), 40);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (pct >= 100 && phase === "loading") setPhase("leaving");
  }, [pct, phase]);

  useEffect(() => {
    if (phase !== "leaving") return;
    const id = window.setTimeout(() => setPhase("gone"), 800);
    return () => window.clearTimeout(id);
  }, [phase]);

  if (phase === "gone") return null;
  return (
    <div className={phase === "leaving" ? "intro intro-out" : "intro"} aria-hidden="true">
      <span className="intro-dot breathe" />
      <span className="intro-pct mono">{String(pct).padStart(3, "0")}</span>
    </div>
  );
}
