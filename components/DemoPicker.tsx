"use client";

import { useEffect, useRef, useState } from "react";
import DemoView from "@/components/demos";
import { demos, type DemoSlug } from "@/lib/demos";
import { site } from "@/lib/site";

// "¿Qué negocio tienes?": la web se transforma en una demo del sector elegido.
// La demo se pinta a tamaño real (ordenador o móvil) y se escala para caber en el marco.
export default function DemoPicker() {
  const [active, setActive] = useState<DemoSlug>("fisio");
  const [size, setSize] = useState({ w: 1100, h: 640 });
  const viewRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setSize({ w, h: w < 640 ? 600 : Math.min(720, Math.max(520, w * 0.58)) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const designW = size.w < 640 ? 390 : 1280; // en móvil se ve la versión móvil de la demo
  const k = size.w / designW;

  const pick = (slug: DemoSlug) => {
    if (slug === active) return;
    const view = viewRef.current;
    const tab = tabRefs.current[slug];
    setActive(slug);
    scrollRef.current?.scrollTo({ top: 0 });
    if (!view || !tab || !view.animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // El cambio nace desde el botón pulsado, como el punto que se expande
    const vr = view.getBoundingClientRect();
    const tr = tab.getBoundingClientRect();
    const x = Math.min(vr.width, Math.max(0, tr.left + tr.width / 2 - vr.left));
    const y = Math.max(0, tr.top + tr.height / 2 - vr.top);
    view.animate(
      [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(150% at ${x}px ${y}px)` }],
      { duration: 800, easing: "cubic-bezier(.7,0,.2,1)" },
    );
  };

  const current = demos.find((d) => d.slug === active)!;
  const domain = site.url.replace(/^https?:\/\//, "");

  return (
    <section id="demos" className="section demos">
      <div className="reveal head">
        <span className="mono lime">Demos</span>
        <h2 className="h2">
          ¿Qué negocio tienes<span className="lime">?</span>
        </h2>
        <p className="lead">Elige tu sector y mira cómo podría verse tu web. Todo funciona: prueba a reservar o a comprar.</p>
      </div>

      <div className="demo-tabs" role="tablist" aria-label="Sectores">
        {demos.map((d) => (
          <button
            key={d.slug}
            ref={(el) => {
              tabRefs.current[d.slug] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${d.slug}`}
            aria-selected={d.slug === active}
            aria-controls="demo-panel"
            className="demo-tab"
            onClick={() => pick(d.slug)}
          >
            <strong>{d.label}</strong>
            <span>{d.sector}</span>
          </button>
        ))}
      </div>

      <div className="browser">
        <div className="browser-bar" aria-hidden="true">
          <span className="browser-dots">
            <span />
            <span />
            <span />
          </span>
          <span className="browser-url">{domain}/demos/{active}</span>
        </div>
        <div ref={viewRef} id="demo-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="browser-view" style={{ height: size.h }}>
          <div className="browser-scale" style={{ width: designW, height: size.h / k, transform: `scale(${k})` }}>
            <div ref={scrollRef} className="browser-scroll">
              <DemoView key={active} slug={active} />
            </div>
          </div>
        </div>
      </div>

      <div className="demo-actions">
        <a href={`/demos/${active}`} className="pill pill-lime tall">
          Abrir {current.business} a pantalla completa
        </a>
        <a href="#contacto" className="pill tall">
          Quiero una así para mi negocio
        </a>
      </div>
    </section>
  );
}
