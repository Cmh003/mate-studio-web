"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

type Anim = {
  ctx: CanvasRenderingContext2D;
  W: number;
  H: number;
  dpr: number;
  x0: number;
  y0: number;
  tw: number;
  fs: number;
  dotR: number;
  side: HTMLCanvasElement;
  top: HTMLCanvasElement;
  lime: HTMLCanvasElement;
  data: Uint8ClampedArray;
  start: number;
  dur: number;
  dy: number;
  fx: number;
  done: boolean;
};

const DEFAULT_NAME = "Tu negocio";
const fontOf = (size: number) => `500 ${size}px "Space Grotesk", system-ui, sans-serif`;

function drawDot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, d: number) {
  ctx.save();
  ctx.shadowColor = "rgba(198,244,50,.85)";
  ctx.shadowBlur = 30 * d;
  ctx.fillStyle = "#C6F432";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// "Ahora, la tuya": el punto recorre las letras del nombre que escribe el visitante
// como si fuera un lápiz, las deja en relieve y termina como punto final.
export default function BrandDraw() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const anim = useRef<Anim | null>(null);
  const raf = useRef(0);
  const [label, setLabel] = useState(DEFAULT_NAME);
  const labelRef = useRef(DEFAULT_NAME);

  const render = useCallback((now: number) => {
    const a = anim.current;
    if (!a) return;
    const { ctx, W, H, dpr: d } = a;
    const raw = Math.min(1, (now - a.start) / a.dur);
    const p = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
    const front = a.x0 + p * a.tw;

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, front + 1, H);
    ctx.clip();
    for (let i = 12; i >= 1; i--) ctx.drawImage(a.side, i * 0.9 * d, i * 0.9 * d);
    ctx.drawImage(a.top, 0, 0);
    ctx.restore();

    if (raw < 1) {
      // Tinta fresca en lima justo detrás del lápiz
      for (const [width, alpha] of [[90, 0.18], [55, 0.4], [26, 0.85]] as const) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.rect(front - width * d, 0, width * d, H);
        ctx.clip();
        ctx.drawImage(a.lime, 0, 0);
        ctx.restore();
      }
      // El punto busca el trazo de la letra en esa columna
      const x = Math.max(0, Math.min(W - 1, Math.floor(front)));
      let best: number | null = null;
      let bestD = Infinity;
      let runStart = -1;
      for (let y = 0; y < H; y += 2) {
        const on = a.data[(y * W + x) * 4 + 3] > 120;
        if (on && runStart < 0) runStart = y;
        if ((!on || y + 2 >= H) && runStart >= 0) {
          const cy = (runStart + y) / 2;
          const dist = Math.abs(cy - a.dy);
          if (dist < bestD) {
            bestD = dist;
            best = cy;
          }
          runStart = -1;
        }
      }
      if (best !== null) a.dy += (best - a.dy) * 0.35;
      a.fx = front;
      drawDot(ctx, front, a.dy, a.dotR * 0.8, d);
    } else {
      // Salto final: el punto se queda como punto final del nombre
      const q = Math.min(1, (now - a.start - a.dur) / 450);
      const e = 1 - Math.pow(1 - q, 3);
      const tx = a.x0 + a.tw + a.dotR * 1.6;
      const ty = a.y0 - a.dotR;
      const x = a.fx + (tx - a.fx) * e;
      const y = a.dy + (ty - a.dy) * e - Math.sin(q * Math.PI) * a.fs * 0.35;
      drawDot(ctx, x, y, a.dotR * (0.8 + 0.2 * e), d);
      if (q >= 1) a.done = true;
    }

    if (!a.done) raf.current = requestAnimationFrame(render);
  }, []);

  const start = useCallback(
    (txt: string, instant = false) => {
      const c = canvasRef.current;
      if (!c) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = Math.max(10, Math.floor(c.clientWidth * dpr));
      const H = Math.max(10, Math.floor(c.clientHeight * dpr));
      c.width = W;
      c.height = H;
      const ctx = c.getContext("2d");
      if (!ctx) return;

      const make = () => {
        const o = document.createElement("canvas");
        o.width = W;
        o.height = H;
        return o;
      };
      const probe = make().getContext("2d")!;
      let fs = H * 0.5;
      probe.font = fontOf(fs);
      let tw = probe.measureText(txt).width;
      const maxW = W * 0.84;
      if (tw > maxW) {
        fs = (fs * maxW) / tw;
        probe.font = fontOf(fs);
        tw = probe.measureText(txt).width;
      }
      const dotR = fs * 0.11;
      const x0 = (W - tw - dotR * 3) / 2;
      const y0 = H * 0.66;

      const layer = (fill: (g: CanvasRenderingContext2D) => string | CanvasGradient) => {
        const o = make();
        const g = o.getContext("2d")!;
        g.font = fontOf(fs);
        g.fillStyle = fill(g);
        g.fillText(txt, x0, y0);
        return o;
      };
      const mask = layer(() => "#ffffff");
      const side = layer(() => "#26262A");
      const top = layer((g) => {
        const gr = g.createLinearGradient(0, y0 - fs, 0, y0);
        gr.addColorStop(0, "#FFFFFF");
        gr.addColorStop(1, "#B9B9B4");
        return gr;
      });
      const lime = layer(() => "#C6F432");
      const data = mask.getContext("2d")!.getImageData(0, 0, W, H).data;

      cancelAnimationFrame(raf.current);
      const now = performance.now();
      anim.current = {
        ctx, W, H, dpr, x0, y0, tw, fs, dotR, side, top, lime, data,
        start: instant ? now - 100000 : now,
        dur: 1400 + txt.length * 110,
        dy: y0 - fs * 0.35,
        fx: x0 + tw,
        done: false,
      };
      labelRef.current = txt;
      setLabel(txt);
      raf.current = requestAnimationFrame(render);
    },
    [render],
  );

  // Se dibuja "Tu negocio" la primera vez que la sección entra en pantalla
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (started || !entries.some((e) => e.isIntersecting)) return;
        started = true;
        io.disconnect();
        document.fonts.ready.then(() => start(DEFAULT_NAME));
      },
      { threshold: 0.35 },
    );
    io.observe(c);

    const onResize = () => {
      if (anim.current) start(labelRef.current, true);
    };
    window.addEventListener("resize", onResize);
    return () => {
      io.disconnect();
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf.current);
    };
  }, [start]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = inputRef.current?.value.trim().slice(0, 22) || DEFAULT_NAME;
    start(value);
  };

  return (
    <section id="tu-marca" className="section brand-draw">
      <div className="reveal head">
        <span className="mono lime">Tu turno</span>
        <h2 className="h2">
          Ahora, la tuya<span className="lime">.</span>
        </h2>
        <p className="lead">Escribe el nombre de tu negocio y mira cómo el punto lo dibuja.</p>
      </div>
      <form className="reveal draw-form" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="name-in" className="mono small">
            Tu negocio
          </label>
          <input id="name-in" ref={inputRef} type="text" maxLength={22} placeholder="Peluquería Lola, Bar Pepe…" autoComplete="off" />
        </div>
        <button type="submit" className="pill pill-lime tall">
          Dibújala
        </button>
      </form>
      <canvas ref={canvasRef} className="draw-canvas" role="img" aria-label={`${label}, dibujado por el punto de Mate Studio`} />
    </section>
  );
}
