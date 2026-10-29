"use client";

import { useEffect, useState } from "react";

// Pantalla de carga: el punto lima respira mientras sube el contador.
export default function Intro() {
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState<"loading" | "leaving" | "gone">("loading");

  useEffect(() => {
    const id = window.setInterval(() => setPct((p) => Math.min(100, p + 7)), 60);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (pct < 100 || phase !== "loading") return;
    setPhase("leaving");
    const id = window.setTimeout(() => setPhase("gone"), 1000);
    return () => window.clearTimeout(id);
  }, [pct, phase]);

  if (phase === "gone") return null;
  return (
    <div className={phase === "leaving" ? "intro intro-out" : "intro"} aria-hidden="true">
      <span className="intro-dot breathe" />
      <span className="intro-pct mono">{String(pct).padStart(3, "0")}</span>
    </div>
  );
}
