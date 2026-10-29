// Toda la información editable de la web está aquí.
// Cambia los valores marcados con TODO por tus datos reales.

export const site = {
  name: "Mate Studio",
  url: "https://matepunto.studio", // TODO: tu dominio definitivo
  city: "Leganés, Madrid",
  description:
    "Estudio web en Leganés. Diseño y desarrollo webs a medida que convierten una idea en una marca que se recuerda.",
  contact: {
    email: "hola@matepunto.studio", // TODO
    whatsapp: "34600000000", // TODO: número con prefijo, sin + ni espacios
    instagram: "https://instagram.com/matestudio", // TODO
    calendar: "", // TODO opcional: enlace de Calendly/Cal.com para agendar llamadas
  },
};

export type Chapter = {
  n: string;
  label: string;
  title: string;
  sub: string;
};

export const chapters: Chapter[] = [
  {
    n: "01",
    label: "Punto",
    title: "Un punto",
    sub: "Tu idea. Pequeña y todavía sin forma. Antes de diseñar nada, te escucho.",
  },
  {
    n: "02",
    label: "Línea",
    title: "Se convierte en línea",
    sub: "Le damos dirección: qué quieres contar, a quién y cómo va a recorrer tu web.",
  },
  {
    n: "03",
    label: "Forma",
    title: "La línea, en forma",
    sub: "Diseño y código hechos a mano, sin plantillas. Movimiento y 3D solo donde aportan.",
  },
  {
    n: "04",
    label: "Marca",
    title: "Y la forma, en marca",
    sub: "La publicamos, la cuidamos cada mes y crece contigo.",
  },
];

export type Project = {
  id: string;
  name: string;
  kind: string;
  description: string;
  tags: string[];
  url?: string;
  theme: { bg: string; fg: string; muted: string; line: string };
  position: { left: string; top: string };
  ghost?: boolean;
};

export const projects: Project[] = [
  {
    id: "antto",
    name: "ANTTŌ",
    kind: "Tienda online",
    description:
      "Tienda online para una marca de ropa: catálogo, carrito y pago seguro con Apple Pay, con una estética de revista de moda.",
    tags: ["E-commerce", "Pagos", "Diseño y código"],
    url: "", // TODO: enlace a la web publicada
    theme: { bg: "#0A0A0B", fg: "#F5F5F2", muted: "#A1A1AA", line: "#3A3A40" },
    position: { left: "22%", top: "32%" },
  },
  {
    id: "finanzas",
    name: "Finanzas",
    kind: "Web app",
    description:
      "Aplicación web de economía personal para entender en qué se va el dinero cada mes. En desarrollo, con Next.js, TypeScript y PostgreSQL.",
    tags: ["Web app", "Datos", "En desarrollo"],
    theme: { bg: "#F5F5F2", fg: "#111113", muted: "#3F3F46", line: "#C4C4C0" },
    position: { left: "70%", top: "24%" },
  },
  {
    id: "tuyo",
    name: "El tuyo",
    kind: "Siguiente",
    description: "El siguiente punto de esta constelación puede ser tu negocio.",
    tags: [],
    theme: { bg: "#C6F432", fg: "#0C0C0E", muted: "#2B3308", line: "#0C0C0E" },
    position: { left: "48%", top: "74%" },
    ghost: true,
  },
];
