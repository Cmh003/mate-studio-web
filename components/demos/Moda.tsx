"use client";

import { useState } from "react";
import { DemoNote } from "./shared";

type Shape = "hoodie" | "tee" | "pants" | "cap" | "jacket" | "bag";
type Product = { id: string; name: string; price: number; shape: Shape; color: string; tag?: string };

const products: Product[] = [
  { id: "p1", name: "Sudadera Norte", price: 69, shape: "hoodie", color: "#1B1B1B", tag: "Nuevo" },
  { id: "p2", name: "Camiseta Pesada", price: 32, shape: "tee", color: "#E8E4DA" },
  { id: "p3", name: "Chaqueta Taller", price: 129, shape: "jacket", color: "#3C4A3E", tag: "Últimas" },
  { id: "p4", name: "Pantalón Recto", price: 79, shape: "pants", color: "#5A4F45" },
  { id: "p5", name: "Gorra Logo", price: 28, shape: "cap", color: "#2340FF" },
  { id: "p6", name: "Bolsa Tote", price: 24, shape: "bag", color: "#C9C2B2" },
];
const SIZES = ["S", "M", "L", "XL"];

const PATHS: Record<Shape, string> = {
  tee: "M40 22 L58 14 Q70 24 82 14 L100 22 L114 46 L98 54 L98 104 L42 104 L42 54 L26 46 Z",
  hoodie: "M40 26 Q48 8 70 8 Q92 8 100 26 L116 52 L100 58 L100 106 L40 106 L40 58 L24 52 Z M58 26 Q70 40 82 26",
  jacket: "M40 20 L60 14 L70 26 L80 14 L100 20 L116 54 L102 58 L102 106 L38 106 L38 58 L24 54 Z M70 26 L70 106",
  pants: "M44 12 L96 12 L100 106 L76 106 L70 44 L64 106 L40 106 Z",
  cap: "M30 70 Q30 30 70 30 Q110 30 110 70 Z M30 70 L124 72 Q120 82 104 80 L30 76 Z",
  bag: "M38 44 L102 44 L106 106 L34 106 Z M54 44 Q54 18 70 18 Q86 18 86 44",
};

function Garment({ shape, color }: { shape: Shape; color: string }) {
  return (
    <svg viewBox="0 0 140 118" aria-hidden="true" className="md-garment">
      <path d={PATHS[shape]} fill={color} stroke="rgba(0,0,0,.25)" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

type Line = { id: string; size: string; qty: number };

export default function Moda() {
  const [open, setOpen] = useState<Product | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [cart, setCart] = useState<Line[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [tried, setTried] = useState(false);

  const count = cart.reduce((a, l) => a + l.qty, 0);
  const total = cart.reduce((a, l) => a + l.qty * (products.find((p) => p.id === l.id)?.price ?? 0), 0);

  const add = () => {
    if (!open || !size) return;
    setCart((c) => {
      const i = c.findIndex((l) => l.id === open.id && l.size === size);
      if (i >= 0) return c.map((l, j) => (j === i ? { ...l, qty: l.qty + 1 } : l));
      return [...c, { id: open.id, size, qty: 1 }];
    });
    setOpen(null);
    setSize(null);
    setCartOpen(true);
  };

  return (
    <div className="dm-shell">
      <div className="dm dm-moda">
        <header className="md-nav">
          <nav aria-label="Tienda" className="md-links">
            <a href="#md-shop">Tienda</a>
            <a href="#md-shop">Colección 01</a>
          </nav>
          <a href="#md-top" className="md-logo">NORTE</a>
          <button type="button" className="md-cart-btn" onClick={() => setCartOpen(true)}>
            Bolsa ({count})
          </button>
        </header>

        <section id="md-top" className="md-hero">
          <p className="md-small">Colección 01 · Invierno</p>
          <h1>
            Ropa para
            <br />
            días largos
          </h1>
          <a href="#md-shop" className="md-btn">Ver colección</a>
        </section>

        <section id="md-shop" className="md-grid">
          {products.map((p) => (
            <button key={p.id} type="button" className="md-product" onClick={() => { setOpen(p); setSize(null); }}>
              <span className="md-img">
                <Garment shape={p.shape} color={p.color} />
                {p.tag ? <span className="md-tag">{p.tag}</span> : null}
              </span>
              <span className="md-pname">{p.name}</span>
              <span className="md-price">{p.price} €</span>
            </button>
          ))}
        </section>

        <footer className="md-foot">
          <span>NORTE · Envío gratis desde 60 €</span>
          <span>Devoluciones en 30 días</span>
        </footer>
      </div>

      {open ? (
        <div className="md-layer" role="dialog" aria-modal="true" aria-label={open.name} onClick={() => setOpen(null)}>
          <div className="md-detail" onClick={(e) => e.stopPropagation()}>
            <div className="md-detail-img">
              <Garment shape={open.shape} color={open.color} />
            </div>
            <div className="md-detail-info">
              <button type="button" className="md-close" onClick={() => setOpen(null)} aria-label="Cerrar">×</button>
              <h2>{open.name}</h2>
              <p className="md-price big">{open.price} €</p>
              <p className="md-small">Algodón orgánico de gramaje alto. Patrón amplio, hecho en Portugal.</p>
              <span className="md-small">Talla</span>
              <div className="md-sizes">
                {SIZES.map((s) => (
                  <button key={s} type="button" className={s === size ? "md-size on" : "md-size"} onClick={() => setSize(s)} aria-pressed={s === size}>
                    {s}
                  </button>
                ))}
              </div>
              <button type="button" className="md-btn wide" disabled={!size} onClick={add}>
                {size ? "Añadir a la bolsa" : "Elige una talla"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {cartOpen ? (
        <div className="md-layer right" role="dialog" aria-modal="true" aria-label="Bolsa" onClick={() => setCartOpen(false)}>
          <aside className="md-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="md-drawer-head">
              <h2>Bolsa ({count})</h2>
              <button type="button" className="md-close" onClick={() => setCartOpen(false)} aria-label="Cerrar bolsa">×</button>
            </div>
            {cart.length === 0 ? (
              <p className="md-small">Tu bolsa está vacía.</p>
            ) : (
              <ul className="md-lines">
                {cart.map((l, i) => {
                  const p = products.find((x) => x.id === l.id)!;
                  return (
                    <li key={l.id + l.size}>
                      <span className="md-thumb"><Garment shape={p.shape} color={p.color} /></span>
                      <div>
                        <strong>{p.name}</strong>
                        <span className="md-small">Talla {l.size}</span>
                        <div className="md-qty">
                          <button type="button" aria-label="Quitar uno" onClick={() => setCart((c) => c.flatMap((x, j) => (j === i ? (x.qty > 1 ? [{ ...x, qty: x.qty - 1 }] : []) : [x])))}>−</button>
                          <span>{l.qty}</span>
                          <button type="button" aria-label="Añadir uno" onClick={() => setCart((c) => c.map((x, j) => (j === i ? { ...x, qty: x.qty + 1 } : x)))}>+</button>
                        </div>
                      </div>
                      <span className="md-price">{p.price * l.qty} €</span>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="md-drawer-foot">
              <div className="md-sum">
                <span>Total</span>
                <strong>{total} €</strong>
              </div>
              <button type="button" className="md-btn wide" disabled={!cart.length} onClick={() => setTried(true)}>
                Finalizar compra
              </button>
              {tried ? <DemoNote>Demo: el pago está desactivado.</DemoNote> : null}
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
