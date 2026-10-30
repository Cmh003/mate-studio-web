"use client";

import { useEffect, useRef, useState } from "react";
import type { Day } from "@/lib/stats";

// Visitantes por día: área con línea, cuadrícula suave, cursor que marca el día y tooltip.
const H = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 40 };

function niceMax(v: number): number {
  if (v <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

export default function DailyChart({ data }: { data: Day[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(720);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const max = niceMax(Math.max(0, ...data.map((d) => d.visitors)));
  const iw = w - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (data.length <= 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const y = (v: number) => PAD.top + ih - (v / max) * ih;
  const past = data.filter((d) => !d.future);
  const line = past.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.visitors).toFixed(1)}`).join(" ");
  const area = `${line} L${x(Math.max(0, past.length - 1)).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));
  const labelEvery = w < 520 ? 7 : 5;

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    const i = Math.round((px / r.width) * (data.length - 1));
    setHover(Math.max(0, Math.min(past.length - 1, i)));
  };

  const h = hover !== null ? data[hover] : null;
  const dayNum = (s: string) => Number(s.slice(8, 10));
  const fmtDay = (s: string) => new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${s}T00:00:00Z`));

  return (
    <div className="pn-chart" ref={wrap}>
      <svg width={w} height={H} role="img" aria-label="Visitantes por día del mes">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={w - PAD.right} y1={y(t)} y2={y(t)} className="pn-grid" />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="pn-axis">
              {t}
            </text>
          </g>
        ))}
        {data.map((d, i) =>
          (i % labelEvery === 0 && data.length - 1 - i >= 3) || i === data.length - 1 ? (
            <text key={d.day} x={x(i)} y={H - 8} textAnchor="middle" className="pn-axis">
              {dayNum(d.day)}
            </text>
          ) : null,
        )}
        <path d={area} className="pn-area" />
        <path d={line} className="pn-line" />
        {h && hover !== null ? (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={y(0)} className="pn-cross" />
            <circle cx={x(hover)} cy={y(h.visitors)} r={5} className="pn-dot" />
          </g>
        ) : null}
        <rect
          x={PAD.left}
          y={PAD.top}
          width={iw}
          height={ih}
          fill="transparent"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          tabIndex={0}
          onFocus={() => setHover(past.length - 1)}
          onBlur={() => setHover(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setHover((v) => Math.max(0, (v ?? 0) - 1));
            if (e.key === "ArrowRight") setHover((v) => Math.min(past.length - 1, (v ?? 0) + 1));
          }}
          aria-label="Recorre los días con las flechas"
        />
      </svg>
      {h && hover !== null ? (
        <div className="pn-tip" style={{ left: Math.min(Math.max(x(hover) - 80, 0), w - 170) }} role="status">
          <strong>{h.visitors}</strong> visitantes
          <span>{h.views} visitas · {fmtDay(h.day)}</span>
        </div>
      ) : null}
      <details className="pn-table">
        <summary>Ver los datos en tabla</summary>
        <table>
          <thead>
            <tr>
              <th>Día</th>
              <th>Visitantes</th>
              <th>Visitas</th>
            </tr>
          </thead>
          <tbody>
            {past.map((d) => (
              <tr key={d.day}>
                <td>{fmtDay(d.day)}</td>
                <td>{d.visitors}</td>
                <td>{d.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
