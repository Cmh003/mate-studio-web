"use client";

import { useEffect, useState } from "react";

export type Day = { key: string; weekday: string; num: number; month: string; closed: boolean };

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// Próximos días a partir de hoy. Se calcula en el navegador para que la fecha sea la del visitante.
export function useNextDays(count: number, closedWeekdays: number[] = [0]): Day[] {
  const [days, setDays] = useState<Day[]>([]);
  const closedKey = closedWeekdays.join(",");
  useEffect(() => {
    const closed = closedKey.split(",").filter(Boolean).map(Number);
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    const out: Day[] = [];
    for (let i = 0; i < count; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      out.push({ key, weekday: WEEKDAYS[d.getDay()], num: d.getDate(), month: MONTHS[d.getMonth()], closed: closed.includes(d.getDay()) });
    }
    setDays(out);
  }, [count, closedKey]);
  return days;
}

export const dayLabel = (d: Day) => `${d.weekday} ${d.num} ${d.month}`;

// Huecos ocupados "realistas": siempre los mismos para el mismo día y hora.
export function isTaken(dayKey: string, slot: string, ratio = 0.35) {
  let h = 2166136261;
  for (const c of dayKey + slot) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000 < ratio;
}

export function timeSlots(start: string, end: string, stepMin: number) {
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
  const out: string[] = [];
  for (let m = toMin(start); m <= toMin(end); m += stepMin) {
    out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  }
  return out;
}

export function DemoNote({ children }: { children: React.ReactNode }) {
  return <p className="dm-note">{children}</p>;
}
