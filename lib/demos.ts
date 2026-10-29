// Demos de sector que se enseñan a los clientes.
// Los negocios son inventados: cambia nombres y textos aquí o en cada componente.

export type DemoSlug = "fisio" | "restaurante" | "peluqueria" | "moda";

export type DemoInfo = {
  slug: DemoSlug;
  label: string; // botón del selector
  sector: string; // texto pequeño bajo el botón
  business: string; // nombre del negocio de ejemplo
  description: string; // para metadatos y la barra de demo
};

export const demos: DemoInfo[] = [
  {
    slug: "fisio",
    label: "Fisio",
    sector: "Citas online",
    business: "Fisio Alameda",
    description: "Clínica de fisioterapia con reserva de citas por servicio, día y hora.",
  },
  {
    slug: "restaurante",
    label: "Restaurante",
    sector: "Carta y reservas",
    business: "Casa Brasa",
    description: "Restaurante con carta por secciones y reserva de mesa por turnos.",
  },
  {
    slug: "peluqueria",
    label: "Peluquería",
    sector: "Servicios y reservas",
    business: "Estudio Lola",
    description: "Peluquería con lista de precios, elección de profesional y reserva.",
  },
  {
    slug: "moda",
    label: "Moda",
    sector: "Tienda online",
    business: "NORTE",
    description: "Marca de ropa con catálogo, ficha de producto, tallas y carrito.",
  },
];

export const demoBySlug = (slug: string) => demos.find((d) => d.slug === slug);
