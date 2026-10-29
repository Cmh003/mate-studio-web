"use client";

import { useState } from "react";
import { DemoNote, dayLabel, isTaken, timeSlots, useNextDays } from "./shared";

const services = [
  { id: "corte", name: "Corte y peinado", min: 45, price: 22 },
  { id: "color", name: "Color raíz", min: 60, price: 38 },
  { id: "mechas", name: "Mechas balayage", min: 120, price: 75 },
  { id: "tratamiento", name: "Tratamiento hidratante", min: 30, price: 25 },
  { id: "recogido", name: "Recogido", min: 60, price: 40 },
];
const staff = [
  { id: "lola", name: "Lola", role: "Color y mechas" },
  { id: "marta", name: "Marta", role: "Corte" },
  { id: "any", name: "Me da igual", role: "La primera libre" },
];
const SLOTS = timeSlots("10:00", "19:30", 30);

export default function Peluqueria() {
  const days = useNextDays(9, [0, 1]);
  const [picked, setPicked] = useState<string[]>(["corte"]);
  const [who, setWho] = useState("any");
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const chosen = services.filter((s) => picked.includes(s.id));
  const total = chosen.reduce((a, s) => a + s.price, 0);
  const mins = chosen.reduce((a, s) => a + s.min, 0);
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const chosenDay = days.find((d) => d.key === day);

  return (
    <div className="dm dm-pelu">
      <header className="pl-nav">
        <a href="#pl-top" className="pl-logo">Estudio Lola</a>
        <a href="#pl-reserva" className="pl-btn">Reservar</a>
      </header>

      <section id="pl-top" className="pl-hero">
        <h1>
          <em>Tu pelo,</em>
          <br />
          sin prisas.
        </h1>
        <div className="pl-hero-side">
          <p>Peluquería de barrio con agenda online. Elige qué te haces, con quién y cuándo, y te guardamos el hueco.</p>
          <a href="#pl-reserva" className="pl-btn">Pedir cita</a>
        </div>
      </section>

      <section id="pl-reserva" className="pl-section">
        <div className="pl-steps">
          <div className="pl-col">
            <h2>Servicios</h2>
            <ul className="pl-list">
              {services.map((s) => (
                <li key={s.id}>
                  <label className={picked.includes(s.id) ? "pl-item on" : "pl-item"}>
                    <input type="checkbox" checked={picked.includes(s.id)} onChange={() => toggle(s.id)} />
                    <span className="pl-name">{s.name}</span>
                    <span className="pl-min">{s.min} min</span>
                    <span className="pl-price">{s.price} €</span>
                  </label>
                </li>
              ))}
            </ul>

            <h2>Con quién</h2>
            <div className="pl-staff">
              {staff.map((p) => (
                <button key={p.id} type="button" className={p.id === who ? "pl-person on" : "pl-person"} onClick={() => setWho(p.id)} aria-pressed={p.id === who}>
                  <span className="pl-face" aria-hidden="true">{p.id === "any" ? "∗" : p.name[0]}</span>
                  <strong>{p.name}</strong>
                  <span>{p.role}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pl-col">
            <h2>Cuándo</h2>
            <div className="pl-days">
              {days.map((d) => (
                <button key={d.key} type="button" disabled={d.closed} className={d.key === day ? "pl-day on" : "pl-day"} onClick={() => { setDay(d.key); setSlot(null); }} aria-pressed={d.key === day}>
                  <span>{d.weekday}</span>
                  <strong>{d.num}</strong>
                </button>
              ))}
            </div>
            {day ? (
              <div className="pl-slots">
                {SLOTS.map((t) => (
                  <button key={t} type="button" disabled={isTaken(day + who, t, 0.45)} className={t === slot ? "pl-slot on" : "pl-slot"} onClick={() => setSlot(t)} aria-pressed={t === slot}>
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <p className="pl-hint">Elige un día para ver los huecos.</p>
            )}

            <div className="pl-summary">
              {done ? (
                <div role="status">
                  <p className="pl-ok">¡Te esperamos!</p>
                  <p>
                    {chosenDay ? dayLabel(chosenDay) : ""} a las {slot} · {staff.find((s) => s.id === who)?.name}
                  </p>
                  <DemoNote>Demo: no se ha enviado ninguna reserva.</DemoNote>
                </div>
              ) : (
                <>
                  <div className="pl-total">
                    <span>{chosen.length ? chosen.map((s) => s.name).join(" + ") : "Elige al menos un servicio"}</span>
                    <strong>
                      {total} € · {Math.floor(mins / 60) ? `${Math.floor(mins / 60)} h ` : ""}
                      {mins % 60 ? `${mins % 60} min` : ""}
                    </strong>
                  </div>
                  <button type="button" className="pl-btn wide" disabled={!chosen.length || !day || !slot} onClick={() => setDone(true)}>
                    Confirmar cita
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="pl-foot">
        <span>Estudio Lola · Calle de ejemplo, 3 · Leganés</span>
        <span>Martes a sábado · 10:00 – 20:00</span>
      </footer>
    </div>
  );
}
