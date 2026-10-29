"use client";

import { FormEvent, useState } from "react";
import { site } from "@/lib/site";

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const { email, whatsapp, instagram, calendar } = site.contact;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (!data.idea?.trim() || !data.contact?.trim()) {
      setStatus("error");
      setError("Cuéntame la idea y cómo contactarte.");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
      setError("No se ha podido enviar. Escríbeme por WhatsApp o email.");
    }
  };

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
          <div className="pills">
            {calendar ? (
              <a href={calendar} target="_blank" rel="noopener noreferrer" className="pill pill-lime">
                Agendar una llamada
              </a>
            ) : null}
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className={calendar ? "pill" : "pill pill-lime"}>
              WhatsApp
            </a>
            <a href={`mailto:${email}`} className="pill">
              {email}
            </a>
            <a href={instagram} target="_blank" rel="noopener noreferrer" className="pill">
              Instagram
            </a>
          </div>
        </div>

        <form className="reveal card" onSubmit={onSubmit} noValidate>
          <span className="mono small muted">O déjame tu idea por escrito</span>
          <div className="field">
            <label htmlFor="c-idea">Tu idea</label>
            <textarea id="c-idea" name="idea" rows={4} placeholder="Tengo un negocio de… y me gustaría…" required />
          </div>
          <div className="field">
            <label htmlFor="c-contact">Teléfono o email</label>
            <input id="c-contact" name="contact" type="text" placeholder="Para responderte" autoComplete="email" required />
          </div>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
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
        <span>© {new Date().getFullYear()} {site.name} · Hecho a mano en Leganés</span>
        <span>Pista: haz doble clic en cualquier sitio</span>
      </footer>
    </section>
  );
}
