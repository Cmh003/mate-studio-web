"use client";

import { useEffect, useRef, useState } from "react";
import type { Extra } from "@/lib/site";
import { PLAN_EVENT, type PlanDetail } from "@/lib/story";

// Lista de servicios + móvil que "escanea" el objeto y muestra lo que vería el cliente.
export default function LocalPreview({ extras, qrSvg }: { extras: Extra[]; qrSvg: string }) {
  const [active, setActive] = useState(extras[0].id);
  const [scan, setScan] = useState(0); // cambia en cada escaneo para reiniciar la animación
  const [scanned, setScanned] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const run = (id: string) => {
    setActive(id);
    setScanned(false);
    setScan((n) => n + 1);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setScanned(true), 900);
  };

  // Al entrar en pantalla hace el primer escaneo solo
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          run(extras[0].id);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = extras.find((e) => e.id === active)!;
  const isNfc = current.tech === "NFC" || active === "resenas";
  const ask = () => {
    const detail: PlanDetail = { need: "local", note: `Me interesa: ${current.name}.` };
    window.dispatchEvent(new CustomEvent(PLAN_EVENT, { detail }));
  };

  return (
    <div className="local-grid" ref={box}>
      <ul className="extras" role="tablist" aria-label="Servicios para tu local">
        {extras.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              role="tab"
              aria-selected={e.id === active}
              className={e.id === active ? "extra on" : "extra"}
              onClick={() => run(e.id)}
            >
              <span className="extra-head">
                <strong>{e.name}</strong>
                <span className="mono tiny tech">{e.tech}</span>
              </span>
              <span className="extra-text">{e.text}</span>
              <span className="extra-price">{e.price}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="stage-local" role="tabpanel" aria-label={current.name}>
        <div className="table-surface" aria-hidden="true" />
        <div key={`obj-${active}`} className={isNfc ? "object nfc" : "object qr"}>
          {isNfc ? (
            <div className="nfc-card">
              <span className="nfc-logo" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M8.5 8.5a5 5 0 0 1 0 7M12 6a8.5 8.5 0 0 1 0 12M15.5 3.5a12 12 0 0 1 0 17" />
                </svg>
              </span>
              <span className="nfc-title">{active === "resenas" ? "¿Te ha gustado?" : "Laura Gil"}</span>
              <span className="nfc-sub">{active === "resenas" ? "Acerca tu móvil y déjanos tu reseña" : "Fisioterapeuta · Fisio Alameda"}</span>
              {active === "resenas" ? <span className="nfc-qr" dangerouslySetInnerHTML={{ __html: qrSvg }} /> : null}
            </div>
          ) : (
            <div className="qr-tent">
              <span className="qr-title">{active === "wifi" ? "WiFi gratis" : active === "reservas" ? "Reserva aquí" : "Nuestra carta"}</span>
              <span className="qr-code" dangerouslySetInnerHTML={{ __html: qrSvg }} />
              <span className="qr-sub">{active === "carta" ? "Escanéalo con tu móvil: es real" : "Escanea con la cámara"}</span>
            </div>
          )}
        </div>

        <div key={`ph-${scan}`} className={scanned ? "phone-local done" : "phone-local scanning"}>
          <div className="phone-screen">
            {!scanned ? (
              <div className="scan-view">
                <span className="scan-ring" />
                <span className="scan-ring r2" />
                <span className="mono tiny">{isNfc ? "Acerca el móvil…" : "Escaneando…"}</span>
              </div>
            ) : (
              <Screen id={active} />
            )}
          </div>
        </div>

        <div className="stage-actions">
          <button type="button" className="pill" onClick={() => run(active)}>
            Repetir
          </button>
          <a href="#contacto" className="pill pill-lime" onClick={ask} data-track={`local:${current.id}`}>
            Lo quiero para mi local
          </a>
        </div>
      </div>
    </div>
  );
}

// Lo que ve el cliente en su móvil después de escanear
function Screen({ id }: { id: string }) {
  if (id === "carta")
    return (
      <div className="sc sc-carta">
        <p className="sc-brand">Casa Brasa</p>
        <div className="sc-tabs"><span className="on">Para picar</span><span>Brasa</span><span>Postres</span></div>
        {[["Croquetas de jamón", "9,50", "Gluten · Leche"], ["Pimientos de Padrón", "7,00", ""], ["Provolone a la brasa", "10,50", "Leche"], ["Pulpo a la brasa", "22,00", "Moluscos"]].map(([n, p, a]) => (
          <div key={n} className="sc-dish">
            <div><strong>{n}</strong>{a ? <span>{a}</span> : null}</div>
            <em>{p} €</em>
          </div>
        ))}
        <div className="sc-lang"><span className="on">ES</span><span>EN</span><span>FR</span></div>
      </div>
    );
  if (id === "resenas")
    return (
      <div className="sc sc-review">
        <p className="sc-small">Reseña en Google</p>
        <p className="sc-brand dark">Casa Brasa</p>
        <div className="sc-stars" aria-label="5 estrellas">
          {[0, 1, 2, 3, 4].map((i) => (
            <svg key={i} viewBox="0 0 24 24" width="30" height="30" style={{ animationDelay: `${i * 90}ms` }}>
              <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" fill="#F5B400" />
            </svg>
          ))}
        </div>
        <div className="sc-textarea">Todo buenísimo, el chuletón espectacular…</div>
        <span className="sc-btn blue">Publicar</span>
      </div>
    );
  if (id === "reservas")
    return (
      <div className="sc sc-book">
        <p className="sc-brand green">Fisio Alameda</p>
        <p className="sc-small">Elige día</p>
        <div className="sc-days">{["Lun 2", "Mar 3", "Mié 4", "Jue 5"].map((d, i) => <span key={d} className={i === 1 ? "on" : ""}>{d}</span>)}</div>
        <p className="sc-small">Hora libre</p>
        <div className="sc-hours">{["09:00", "10:30", "11:15", "12:00", "16:30", "18:00"].map((h, i) => <span key={h} className={i === 2 ? "on" : i === 3 ? "off" : ""}>{h}</span>)}</div>
        <span className="sc-btn green">Confirmar cita</span>
      </div>
    );
  if (id === "tarjeta")
    return (
      <div className="sc sc-card">
        <span className="sc-avatar">LG</span>
        <p className="sc-brand dark">Laura Gil</p>
        <p className="sc-small">Fisioterapeuta · Fisio Alameda</p>
        <span className="sc-btn green">Guardar contacto</span>
        <span className="sc-btn ghost">Ver web</span>
        <span className="sc-btn ghost">Pedir cita</span>
      </div>
    );
  return (
    <div className="sc sc-wifi">
      <span className="sc-check">✓</span>
      <p className="sc-brand dark">Conectado</p>
      <p className="sc-small">CasaBrasa_Clientes</p>
      <span className="sc-btn ghost">Ver la carta</span>
    </div>
  );
}
