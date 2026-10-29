"use client";

import type { DemoSlug } from "@/lib/demos";
import Fisio from "./Fisio";
import Moda from "./Moda";
import Peluqueria from "./Peluqueria";
import Restaurante from "./Restaurante";

export default function DemoView({ slug }: { slug: DemoSlug }) {
  switch (slug) {
    case "fisio":
      return <Fisio />;
    case "restaurante":
      return <Restaurante />;
    case "peluqueria":
      return <Peluqueria />;
    case "moda":
      return <Moda />;
  }
}
