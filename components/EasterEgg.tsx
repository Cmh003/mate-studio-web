"use client";

import { useEffect, useRef, useState } from "react";
import { setEggActive } from "@/lib/story";

type Ball = { x: number; y: number; vx: number; vy: number; r: number; last: number };

// Doble clic en cualquier sitio: el punto se escapa del logo 3D y rebota por la
// pantalla, aterrizando sobre los titulares. Al pulsarlo, vuelve a su sitio.
export default function EasterEgg() {
  const [active, setActive] = useState(false);
  const ballRef = useRef<HTMLButtonElement>(null);
  const ball = useRef<Ball | null>(null);

  useEffect(() => {
    const onDbl = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (ball.current || target?.closest("input, textarea, button, a, .project, canvas.draw-canvas")) return;
      const dir = Math.random() < 0.5 ? -1 : 1;
      ball.current = { x: e.clientX, y: e.clientY, vx: dir * (500 + Math.random() * 400), vy: -1100, r: 22, last: performance.now() };
      setActive(true);
      setEggActive(true);
    };
    document.addEventListener("dblclick", onDbl);
    return () => document.removeEventListener("dblclick", onDbl);
  }, []);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      const g = ball.current;
      const el = ballRef.current;
      if (!g || !el) return;
      const dt = Math.min(0.033, (now - g.last) / 1000);
      g.last = now;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const prevY = g.y;
      g.vy += 2200 * dt;
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      if (g.x < g.r) { g.x = g.r; g.vx = Math.abs(g.vx) * 0.8; }
      if (g.x > W - g.r) { g.x = W - g.r; g.vx = -Math.abs(g.vx) * 0.8; }
      if (g.y < g.r) { g.y = g.r; g.vy = Math.abs(g.vy) * 0.6; }
      if (g.y > H - g.r) {
        g.y = H - g.r;
        g.vy = -Math.abs(g.vy) * 0.72;
        g.vx *= 0.985;
        if (Math.abs(g.vy) < 140) g.vy = -900 - Math.random() * 300;
      }
      // Aterriza sobre los titulares visibles
      document.querySelectorAll("h1, h2").forEach((h) => {
        const r = h.getBoundingClientRect();
        if (r.bottom < 0 || r.top > H || r.width < 10) return;
        if (g.vy > 0 && prevY + g.r <= r.top + 6 && g.y + g.r >= r.top && g.x > r.left && g.x < r.right) {
          g.y = r.top - g.r;
          g.vy = -Math.abs(g.vy) * 0.74;
          g.vx *= 0.98;
          if (Math.abs(g.vy) < 160) g.vy = -820;
        }
      });
      el.style.transform = `translate(${g.x - g.r}px, ${g.y - g.r}px)`;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const catchIt = () => {
    ball.current = null;
    setActive(false);
    setEggActive(false);
  };

  return (
    <button
      ref={ballRef}
      type="button"
      className={active ? "egg on" : "egg"}
      onClick={catchIt}
      aria-label="Atrapar el punto"
      tabIndex={active ? 0 : -1}
    />
  );
}
