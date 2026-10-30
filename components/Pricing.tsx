"use client";

import { maintenance, plans } from "@/lib/site";
import { PLAN_EVENT } from "@/lib/story";

export default function Pricing() {
  const choose = (id: string) => () => {
    window.dispatchEvent(new CustomEvent(PLAN_EVENT, { detail: id }));
  };

  return (
    <section id="precios" className="section pricing">
      <div className="reveal head">
        <span className="mono lime">Precios</span>
        <h2 className="h2">
          Precio cerrado, sin sorpresas<span className="lime">.</span>
        </h2>
        <p className="lead">Son precios de partida. Después de hablar te doy un presupuesto exacto por escrito, antes de empezar.</p>
      </div>

      <div className="plans">
        {plans.map((p) => (
          <article key={p.id} className={p.featured ? "plan reveal featured" : "plan reveal"}>
            <h3>{p.name}</h3>
            <p className="plan-for">{p.forWho}</p>
            <p className="plan-price">
              <span className="mono tiny muted">Desde</span>
              <strong>{p.price} €</strong>
            </p>
            <ul>
              {p.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <a href="#contacto" className={p.featured ? "pill pill-lime tall" : "pill tall"} onClick={choose(p.id)} data-track={`precio:${p.id}`}>
              Pedir presupuesto
            </a>
          </article>
        ))}
      </div>

      <div className="reveal plan-extra">
        <p>
          <strong>Mantenimiento: {maintenance.price} €/mes</strong>
          <span>{maintenance.text}</span>
        </p>
        <p className="mono tiny muted">Precios sin IVA</p>
      </div>
    </section>
  );
}
