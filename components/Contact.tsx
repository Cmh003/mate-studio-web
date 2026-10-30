"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { plans, site } from "@/lib/site";
import { PLAN_EVENT, type PlanDetail } from "@/lib/story";
import { track } from "@/lib/track";

type Status = "idle" | "sending" | "sent" | "error";

const needs = [...plans.map((p) => ({ id: p.id, label: p.name })), { id: "local", label: "QR o NFC para mi local" }, { id: "otro", label: "Aún no lo sé" }];

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [need, setNeed] = useState("");
  const ideaRef = useRef<HTMLTextAreaElement>(null);
  const { email, whatsapp, instagram, calendar } = site.contact;

  // Los botones de la sección de precios preseleccionan lo que necesitas
  useEffect(() => {
    const onPlan = (e: Event) => {
      const d = (e as CustomEvent<PlanDetail>).detail;
      if (typeof d === "string") return setNeed(d);
      setNeed(d.need);
      const ta = ideaRef.current;
      if (d.note && ta && !ta.value.trim()) ta.value = d.note + " ";
    };
    window.addEventListener(PLAN_EVENT, onPlan);
    return () => window.removeEventListener(PLAN_EVENT, onPlan);
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (!data.idea?.trim() || !data.contact?.trim()) {
      setStatus("error");
      setError("Cuéntame la idea y cómo contactarte.");
      return;
    }
    if (!data.privacy) {
      setStatus("error");
      setError("Para poder responderte, acepta la política de privacidad.");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, need: needs.find((n) => n.id === data.need)?.label ?? "" }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      track("formulario_enviado");
      setNeed("");
      form.reset();
    } catch {
      setStatus("error");
      setError(email ? `No se ha podido enviar. Escríbeme a ${email}.` : "No se ha podido enviar. Inténtalo de nuevo en unos minutos.");
    }
  };

  const channels = [
    calendar ? { href: calendar, label: "Agendar una llamada", ext: true } : null,
    email ? { href: `mailto:${email}`, label: email, ext: false } : null,
    whatsapp ? { href: `https://wa.me/${whatsapp}`, label: "WhatsApp", ext: true } : null,
    instagram ? { href: instagram, label: "Instagram", ext: true } : null,
  ].filter(Boolean) as { href: string; label: string; ext: boolean }[];

  return (
    <section id="contacto" className="section contact">
      <div className="grid2">
        <div className="reveal contact-copy">
          <span className="mono lime">Contacto</span>
          <h2 className="h-contact">
            ¿Cuál es
            <br />
            tu punto<span className="lime">?</span>
          </h2>
          <p className="lead">Cuéntame tu idea, aunque sea pequeña. Te respondo en menos de 24 horas con una propuesta y un precio cerrado.</p>
          {channels.length ? (
            <div className="pills">
              {channels.map((c, i) => (
                <a key={c.href} href={c.href} className={i === 0 ? "pill pill-lime" : "pill"} {...(c.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  {c.label}
                </a>
              ))}
            </div>
          ) : (
            <ul className="steps-list">
              <li><span className="mono lime">1</span> Me cuentas tu idea en el formulario.</li>
              <li><span className="mono lime">2</span> Te respondo en menos de 24 horas.</li>
              <li><span className="mono lime">3</span> Te envío una propuesta con precio cerrado.</li>
            </ul>
          )}
        </div>

        <form className="reveal card" onSubmit={onSubmit} noValidate>
          <span className="mono small muted">Cuéntame tu idea</span>
          <fieldset className="need">
            <legend>¿Qué necesitas?</legend>
            <div className="need-options">
              {needs.map((n) => (
                <label key={n.id} className={need === n.id ? "need-opt on" : "need-opt"}>
                  <input type="radio" name="need" value={n.id} checked={need === n.id} onChange={() => setNeed(n.id)} />
                  {n.label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="c-idea">Tu idea</label>
            <textarea ref={ideaRef} id="c-idea" name="idea" rows={4} placeholder="Tengo un negocio de… y me gustaría…" required />
          </div>
          <div className="field">
            <label htmlFor="c-contact">Teléfono o email</label>
            <input id="c-contact" name="contact" type="text" placeholder="Para responderte" autoComplete="email" required />
          </div>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
          <label className="check">
            <input type="checkbox" name="privacy" value="si" required />
            <span>
              He leído y acepto la <a href="/privacidad">política de privacidad</a>.
            </span>
          </label>
          <p className="legal-note">
            Responsable: {site.legal.owner}. Uso tus datos solo para responder a tu mensaje y no los cedo a nadie. Puedes acceder a ellos, corregirlos o
            borrarlos cuando quieras. Más información en la <a href="/privacidad">política de privacidad</a>.
          </p>
          <button type="submit" className="pill pill-lime tall" disabled={status === "sending"}>
            {status === "sending" ? "Enviando…" : "Enviar"}
          </button>
          <p role="status" aria-live="polite" className={status === "error" ? "form-msg lime" : "form-msg"}>
            {status === "sent" ? "¡Recibido! Te respondo en menos de 24 horas." : status === "error" ? error : ""}
          </p>
          {status === "sent" && <span className="stamp mono">Recibida</span>}
        </form>
      </div>

      <footer className="footer mono tiny">
        <span>
          © {new Date().getFullYear()} {site.name} · Hecho a mano en Leganés
        </span>
        <nav className="footer-links" aria-label="Legal">
          <a href="/aviso-legal">Aviso legal</a>
          <a href="/privacidad">Privacidad</a>
        </nav>
      </footer>
    </section>
  );
}
