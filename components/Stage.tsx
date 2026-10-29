"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import Scene3D from "./Scene3D";
import { chapters } from "@/lib/site";
import { storyProgress } from "@/lib/story";

// Capa fija detrás del contenido: escena 3D, cabecera e indicador de fase.
export default function Stage() {
  const [active, setActive] = useState(0);
  const [pastStory, setPastStory] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const s = storyProgress(window.scrollY, window.innerHeight);
      setActive(s < 0.22 ? 0 : s < 0.5 ? 1 : s < 0.74 ? 2 : 3);
      setPastStory(window.scrollY > window.innerHeight * 5.3);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div className="stage">
        <Scene3D />
      </div>

      <header className={pastStory ? "header solid" : "header"}>
        <a href="#inicio" className="brand" aria-label="Mate Studio, inicio">
          <Logo />
          <span>
            <strong>mate</strong>
            <span className="muted"> studio</span>
          </span>
        </a>
        <nav className="nav hide-sm" aria-label="Principal">
          <a href="#proceso">Proceso</a>
          <a href="#demos">Demos</a>
          <a href="#trabajos">Trabajos</a>
          <a href="#contacto">Contacto</a>
        </nav>
        <a href="#contacto" className="pill">
          Cuéntame tu idea
        </a>
      </header>

      <ol className={pastStory ? "steps hide-sm mono gone" : "steps hide-sm mono"} aria-label="Fases">
        {chapters.map((c, i) => (
          <li key={c.n} className={i === active ? "step on" : "step"} aria-current={i === active ? "step" : undefined}>
            <span className="sd" aria-hidden="true" />
            {c.label}
          </li>
        ))}
      </ol>
    </>
  );
}
