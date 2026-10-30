"use client";

import { MouseEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { projects, type Project } from "@/lib/site";

// Trabajos como constelación: cada proyecto es un punto. Al pulsarlo,
// el punto crece hasta llenar la pantalla con la ficha del proyecto.
export default function Constellation() {
  const [open, setOpen] = useState<Project | null>(null);
  const origin = useRef({ x: 0, y: 0 });
  const overlay = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  const show = (p: Project) => (e: MouseEvent<HTMLButtonElement>) => {
    const core = e.currentTarget.querySelector(".core")?.getBoundingClientRect();
    origin.current = core
      ? { x: core.left + core.width / 2, y: core.top + core.height / 2 }
      : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    opener.current = e.currentTarget;
    setOpen(p);
  };

  const close = () => {
    const el = overlay.current;
    const { x, y } = origin.current;
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      setOpen(null);
      opener.current?.focus();
    };
    if (el?.animate) {
      const a = el.animate(
        [{ clipPath: `circle(150vmax at ${x}px ${y}px)` }, { clipPath: `circle(0px at ${x}px ${y}px)` }],
        { duration: 600, easing: "cubic-bezier(.7,0,.2,1)", fill: "forwards" },
      );
      a.onfinish = done;
      // Por si el navegador va cargado y la animación no avisa a tiempo
      window.setTimeout(done, 700);
    } else done();
  };

  useEffect(() => {
    if (!open) return;
    const el = overlay.current;
    const { x, y } = origin.current;
    el?.animate?.(
      [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(150vmax at ${x}px ${y}px)` }],
      { duration: 900, easing: "cubic-bezier(.7,0,.2,1)" },
    );
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    document.body.dataset.overlay = "1"; // pausa la escena 3D mientras la ficha está abierta
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      delete document.body.dataset.overlay;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <section id="trabajos" className="section works">
      <div className="reveal head row">
        <div>
          <span className="mono lime">Trabajos</span>
          <h2 className="h2">
            Puntos de partida<span className="lime">.</span>
          </h2>
        </div>
        <span className="mono small muted">Pulsa un punto</span>
      </div>

      <div className="sky">
        <svg className="sky-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path
            d={`M${projects.map((p) => `${parseFloat(p.position.left)} ${parseFloat(p.position.top)}`).join(" L")} Z`}
            fill="none"
            stroke="rgba(245,245,242,.14)"
            strokeWidth="1"
            strokeDasharray="4 5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {projects.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className={p.ghost ? "star ghost" : "star"}
            style={{ left: p.position.left, top: p.position.top, animationDelay: `${-i * 3}s` }}
            onClick={show(p)}
            data-track={`proyecto:${p.id}`}
            aria-haspopup="dialog"
          >
            <span className="core" aria-hidden="true" />
            <span className="lbl">{p.name}</span>
            <span className="mono tiny muted">{p.kind}</span>
          </button>
        ))}
      </div>

      {open && createPortal(
        <div
          ref={overlay}
          className="project"
          role="dialog"
          aria-modal="true"
          aria-label={open.name}
          style={{ background: open.theme.bg, color: open.theme.fg }}
        >
          <div className="project-inner">
            <div className="project-top">
              <span className="mono small" style={{ opacity: 0.7 }}>
                Proyecto
              </span>
              <button ref={closeBtn} type="button" className="close" onClick={close} aria-label="Cerrar proyecto">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {open.ghost ? (
              <div className="pin project-body center">
                <h2 className="project-title tight">
                  Este hueco
                  <br />
                  es tuyo.
                </h2>
                <p className="project-text">{open.description}</p>
                <a href="#contacto" className="pill dark tall" onClick={close}>
                  Hablemos
                </a>
              </div>
            ) : (
              <div className="pin project-body">
                <h2 className={open.id === "antto" ? "project-title wide" : "project-title"}>
                  {open.name}
                  {open.id !== "antto" && <span style={{ color: "#4D7C0F" }}>.</span>}
                </h2>
                <p className="project-text" style={{ color: open.theme.muted }}>
                  {open.description}
                </p>
                <ul className="tags">
                  {open.tags.map((t) => (
                    <li key={t} className="mono tiny" style={{ borderColor: open.theme.line }}>
                      {t}
                    </li>
                  ))}
                </ul>
                {open.id === "finanzas" ? (
                  <div className="preview bars" aria-hidden="true">
                    {[50, 85, 38, 66, 28, 74].map((h, i) => (
                      <span key={i} style={{ height: `${h}%`, background: i === 1 ? "#C6F432" : "#111113" }} />
                    ))}
                  </div>
                ) : (
                  <div className="preview tiles" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                )}
                {open.url ? (
                  <a href={open.url} target="_blank" rel="noopener noreferrer" className="pill tall" style={{ alignSelf: "flex-start", color: "inherit", borderColor: open.theme.line }}>
                    Ver la web
                  </a>
                ) : null}
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}
