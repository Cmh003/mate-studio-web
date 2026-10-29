"use client";

import { useEffect, useRef } from "react";

// Cursor: un punto lima que se convierte en anillo sobre enlaces y botones.
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = ref.current;
    if (!el) return;
    el.classList.add("on");
    const move = (e: MouseEvent) => {
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };
    const over = (e: MouseEvent) => {
      const target = e.target as Element | null;
      el.classList.toggle("big", Boolean(target?.closest("a, button, input, textarea, label")));
    };
    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
    };
  }, []);

  return <div ref={ref} className="cursor" aria-hidden="true" />;
}
