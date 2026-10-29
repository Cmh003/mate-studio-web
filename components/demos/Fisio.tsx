"use client";

import { FormEvent, useState } from "react";
import { DemoNote, dayLabel, isTaken, timeSlots, useNextDays } from "./shared";

const services = [
  { id: "deportiva", name: "Fisioterapia deportiva", min: 45, price: 40, text: "Lesiones musculares, tendinitis y vuelta al deporte." },
  { id: "suelo", name: "Suelo pélvico", min: 50, price: 45, text: "Valoración y tratamiento en consulta privada." },
  { id: "puncion", name: "Punción seca", min: 30, price: 35, text: "Para puntos gatillo y contracturas que no ceden." },
  { id: "masaje", name: "Masaje descontracturante", min: 45, price: 38, text: "Espalda, cuello y hombros cargados." },
];

const SLOTS = timeSlots("09:00", "19:30", 45);

export default function Fisio() {
  const days = useNextDays(10, [0, 6]);
  const [service, setService] = useState(services[0].id);
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [done, setDone] = useState<null | { name: string }>(null);

  const svc = services.find((s) => s.id === service)!;
  const chosenDay = days.find((d) => d.key === day);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get("name") || "").trim();
    if (!day || !slot || !name) return;
    setDone({ name });
  };

  return (
    <div className="dm dm-fisio">
      <header className="fz-nav">
        <a href="#fz-top" className="fz-logo">
          <span className="fz-mark" aria-hidden="true" />
          Fisio Alameda
        </a>
        <nav className="fz-links" aria-label="Clínica">
          <a href="#fz-servicios">Tratamientos</a>
          <a href="#fz-equipo">Equipo</a>
          <a href="#fz-cita" className="fz-btn">Pedir cita</a>
        </nav>
      </header>

      <section id="fz-top" className="fz-hero">
        <div className="fz-hero-text">
          <p className="fz-eyebrow">Fisioterapia en Leganés</p>
          <h1>Vuelve a moverte sin dolor.</h1>
          <p className="fz-lead">Valoramos tu caso en la primera sesión y te explicamos el plan de tratamiento antes de empezar.</p>
          <div className="fz-row">
            <a href="#fz-cita" className="fz-btn">Reservar cita</a>
            <span className="fz-hours">Lun a vie · 9:00 – 20:00</span>
          </div>
        </div>
        <div className="fz-card fz-next" aria-label="Próximo hueco libre">
          <span className="fz-small">Próximo hueco libre</span>
          <strong>{days.find((d) => !d.closed) ? `${dayLabel(days.find((d) => !d.closed)!)} · 10:30` : "Hoy · 10:30"}</strong>
          <span className="fz-small">Fisioterapia deportiva · 45 min</span>
        </div>
      </section>

      <section id="fz-servicios" className="fz-section">
        <h2>Tratamientos</h2>
        <div className="fz-grid">
          {services.map((s) => (
            <article key={s.id} className="fz-card">
              <h3>{s.name}</h3>
              <p>{s.text}</p>
              <p className="fz-meta">
                {s.min} min · <strong>{s.price} €</strong>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="fz-equipo" className="fz-section fz-team">
        <h2>Equipo</h2>
        <div className="fz-grid fz-grid-3">
          {[
            ["Laura Gil", "Fisioterapia deportiva"],
            ["Pablo Ruiz", "Suelo pélvico y punción seca"],
            ["Ana Soto", "Terapia manual"],
          ].map(([n, r]) => (
            <div key={n} className="fz-person">
              <span className="fz-avatar" aria-hidden="true">{n.split(" ").map((x) => x[0]).join("")}</span>
              <div>
                <strong>{n}</strong>
                <span className="fz-small">{r}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="fz-cita" className="fz-section">
        <h2>Pide tu cita</h2>
        {done ? (
          <div className="fz-card fz-done" role="status">
            <span className="fz-check" aria-hidden="true">✓</span>
            <h3>Cita reservada, {done.name}</h3>
            <p>
              {svc.name} · {chosenDay ? dayLabel(chosenDay) : ""} a las {slot}
            </p>
            <button type="button" className="fz-btn ghost" onClick={() => { setDone(null); setSlot(null); setDay(null); }}>
              Reservar otra
            </button>
            <DemoNote>Demo: no se ha enviado ninguna reserva.</DemoNote>
          </div>
        ) : (
          <form className="fz-card fz-booking" onSubmit={submit}>
            <fieldset>
              <legend>1. Tratamiento</legend>
              <div className="fz-chips">
                {services.map((s) => (
                  <button type="button" key={s.id} className={s.id === service ? "fz-chip on" : "fz-chip"} onClick={() => setService(s.id)} aria-pressed={s.id === service}>
                    {s.name}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>2. Día</legend>
              <div className="fz-days">
                {days.map((d) => (
                  <button
                    type="button"
                    key={d.key}
                    disabled={d.closed}
                    className={d.key === day ? "fz-day on" : "fz-day"}
                    onClick={() => { setDay(d.key); setSlot(null); }}
                    aria-pressed={d.key === day}
                  >
                    <span>{d.weekday}</span>
                    <strong>{d.num}</strong>
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>3. Hora</legend>
              {day ? (
                <div className="fz-slots">
                  {SLOTS.map((t) => {
                    const taken = isTaken(day + service, t);
                    return (
                      <button type="button" key={t} disabled={taken} className={t === slot ? "fz-slot on" : "fz-slot"} onClick={() => setSlot(t)} aria-pressed={t === slot}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="fz-small">Elige primero un día.</p>
              )}
            </fieldset>
            <div className="fz-final">
              <label className="fz-field">
                <span>Nombre</span>
                <input name="name" required placeholder="Tu nombre" autoComplete="name" />
              </label>
              <label className="fz-field">
                <span>Teléfono</span>
                <input name="phone" type="tel" placeholder="600 000 000" autoComplete="tel" />
              </label>
              <button type="submit" className="fz-btn" disabled={!day || !slot}>
                Confirmar · {svc.price} €
              </button>
            </div>
          </form>
        )}
      </section>

      <footer className="fz-foot">
        <span>Fisio Alameda · Calle de ejemplo, 12 · Leganés</span>
        <span>Cancelación gratuita hasta 24 h antes</span>
      </footer>
    </div>
  );
}
