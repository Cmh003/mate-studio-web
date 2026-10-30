"use client";

import { PLAN_EVENT, type PlanDetail } from "@/lib/story";

export default function PackButton({ need, note, label = "Lo quiero", trackAs }: { need: string; note?: string; label?: string; trackAs?: string }) {
  const detail: PlanDetail = { need, note };
  return (
    <a href="#contacto" className="pill tall" data-track={trackAs} onClick={() => window.dispatchEvent(new CustomEvent(PLAN_EVENT, { detail }))}>
      {label}
    </a>
  );
}
