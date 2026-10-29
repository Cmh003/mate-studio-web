"use client";

import { useState } from "react";
import { DemoNote, dayLabel, isTaken, useNextDays } from "./shared";

const menu: Record<string, { name: string; text: string; price: string }[]> = {
  "Para picar": [
    { name: "Croquetas de jamón", text: "Seis unidades, bechamel de leche fresca.", price: "9,50" },
    { name: "Pimientos de Padrón", text: "Con sal en escamas.", price: "7,00" },
    { name: "Provolone a la brasa", text: "Con orégano y tomate seco.", price: "10,50" },
    { name: "Ensalada de tomate", text: "Tomate de temporada, ventresca y cebolleta.", price: "12,00" },
  ],
  "De la brasa": [
    { name: "Chuletón de vaca", text: "1 kg aprox., para compartir. Patatas y pimientos.", price: "58,00" },
    { name: "Secreto ibérico", text: "Con chimichurri de la casa.", price: "18,50" },
    { name: "Pulpo a la brasa", text: "Sobre parmentier de patata ahumada.", price: "22,00" },
    { name: "Verduras de temporada", text: "Con romesco.", price: "13,00" },
  ],
  Postres: [
    { name: "Tarta de queso", text: "Cremosa, horneada al momento.", price: "6,50" },
    { name: "Torrija", text: "Con helado de vainilla.", price: "6,00" },
    { name: "Fruta asada", text: "Piña a la brasa con lima.", price: "5,50" },
  ],
};

const turns = { Comida: ["13:30", "14:00", "14:30", "15:00"], Cena: ["20:30", "21:00", "21:30", "22:00", "22:30"] };

export default function Restaurante() {
  const days = useNextDays(8, [1]);
  const [tab, setTab] = useState(Object.keys(menu)[0]);
  const [people, setPeople] = useState(2);
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const chosen = days.find((d) => d.key === day);

  return (
    <div className="dm dm-resto">
      <header className="rs-nav">
        <a href="#rs-top" className="rs-logo">Casa Brasa</a>
        <nav aria-label="Restaurante">
          <a href="#rs-carta">Carta</a>
          <a href="#rs-reserva" className="rs-btn">Reservar</a>
        </nav>
      </header>

      <section id="rs-top" className="rs-hero">
        <div className="rs-ember" aria-hidden="true" />
        <p className="rs-kicker">Cocina a la brasa · Leganés</p>
        <h1>
          Fuego lento,
          <br />
          <em>mesa larga.</em>
        </h1>
        <p className="rs-lead">Producto de temporada, carbón de encina y una carta corta que cambia con el mercado.</p>
        <div className="rs-row">
          <a href="#rs-reserva" className="rs-btn">Reservar mesa</a>
          <a href="#rs-carta" className="rs-link">Ver la carta</a>
        </div>
      </section>

      <section id="rs-carta" className="rs-section">
        <h2>La carta</h2>
        <div className="rs-tabs" role="tablist" aria-label="Secciones de la carta">
          {Object.keys(menu).map((k) => (
            <button key={k} role="tab" aria-selected={k === tab} className={k === tab ? "rs-tab on" : "rs-tab"} onClick={() => setTab(k)}>
              {k}
            </button>
          ))}
        </div>
        <ul className="rs-menu" role="tabpanel" aria-label={tab}>
          {menu[tab].map((d) => (
            <li key={d.name}>
              <div>
                <strong>{d.name}</strong>
                <span>{d.text}</span>
              </div>
              <span className="rs-dots" aria-hidden="true" />
              <span className="rs-price">{d.price} €</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="rs-reserva" className="rs-section rs-book">
        <h2>Reserva tu mesa</h2>
        {done ? (
          <div className="rs-ticket" role="status">
            <span className="rs-kicker">Reserva confirmada</span>
            <strong>
              Mesa para {people} · {chosen ? dayLabel(chosen) : ""} · {time}
            </strong>
            <span>Te esperamos. Si no puedes venir, avísanos por teléfono.</span>
            <button type="button" className="rs-link" onClick={() => { setDone(false); setTime(null); }}>
              Hacer otra reserva
            </button>
            <DemoNote>Demo: no se ha enviado ninguna reserva.</DemoNote>
          </div>
        ) : (
          <div className="rs-form">
            <div className="rs-block">
              <span className="rs-label">Personas</span>
              <div className="rs-stepper">
                <button type="button" onClick={() => setPeople((p) => Math.max(1, p - 1))} aria-label="Una persona menos">−</button>
                <output aria-live="polite">{people}</output>
                <button type="button" onClick={() => setPeople((p) => Math.min(12, p + 1))} aria-label="Una persona más">+</button>
              </div>
            </div>
            <div className="rs-block">
              <span className="rs-label">Día</span>
              <div className="rs-days">
                {days.map((d) => (
                  <button key={d.key} type="button" disabled={d.closed} className={d.key === day ? "rs-day on" : "rs-day"} onClick={() => { setDay(d.key); setTime(null); }} aria-pressed={d.key === day}>
                    <span>{d.closed ? "Cerrado" : d.weekday}</span>
                    <strong>{d.num}</strong>
                  </button>
                ))}
              </div>
            </div>
            <div className="rs-block">
              <span className="rs-label">Hora</span>
              {day ? (
                <div className="rs-turns">
                  {Object.entries(turns).map(([name, hours]) => (
                    <div key={name}>
                      <span className="rs-sub">{name}</span>
                      <div className="rs-hours">
                        {hours.map((h) => (
                          <button key={h} type="button" disabled={isTaken(day + people, h, 0.3)} className={h === time ? "rs-hour on" : "rs-hour"} onClick={() => setTime(h)} aria-pressed={h === time}>
                            {h}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="rs-sub">Elige un día para ver las horas libres.</span>
              )}
            </div>
            <button type="button" className="rs-btn big" disabled={!day || !time} onClick={() => setDone(true)}>
              Confirmar reserva
            </button>
          </div>
        )}
      </section>

      <footer className="rs-foot">
        <span>Casa Brasa · Calle de ejemplo, 8 · Leganés</span>
        <span>Martes a domingo · Lunes cerrado</span>
      </footer>
    </div>
  );
}
