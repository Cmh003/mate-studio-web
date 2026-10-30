"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track, trackView } from "@/lib/track";

// Cuenta visitas por página y clics en cualquier elemento con data-track="nombre".
export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/panel")) return;
    trackView(pathname);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-track]");
      const name = el?.dataset.track;
      if (name) track(name);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
