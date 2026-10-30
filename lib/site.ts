// Toda la información editable de la web está aquí.
// Cambia los valores marcados con TODO por tus datos reales.

export const site = {
  name: "Mate Studio",
  // Dominio definitivo. Mientras no lo tengas, la web usa sola la dirección de Vercel.
  url: "https://matepunto.studio", // TODO
  city: "Leganés, Madrid",
  description:
    "Estudio web en Leganés. Diseño y desarrollo webs a medida que convierten una idea en una marca que se recuerda.",
  contact: {
    // Cada canal que dejes vacío ("") desaparece de la web.
    email: "", // TODO: tu email profesional cuando tengas dominio (p. ej. hola@tudominio.com)
    whatsapp: "", // número con prefijo, sin + ni espacios (p. ej. 34600000000)
    instagram: "", // enlace completo a tu perfil
    calendar: "", // enlace de Calendly/Cal.com para agendar llamadas
  },
  // Datos para el aviso legal y la política de privacidad (obligatorios en España).
  legal: {
    owner: "[TU NOMBRE Y APELLIDOS]", // TODO
    nif: "[TU NIF]", // TODO
    address: "[TU DIRECCIÓN POSTAL], Leganés (Madrid)", // TODO
    email: "[EMAIL DE CONTACTO PARA TEMAS LEGALES]", // TODO
  },
};

export type Plan = {
  id: string;
  name: string;
  price: string;
  forWho: string;
  features: string[];
  featured?: boolean;
};

// Precios orientativos. Cámbialos a lo que quieras cobrar.
export const plans: Plan[] = [
  {
    id: "web",
    name: "Web para tu negocio",
    price: "450",
    forWho: "Bares, talleres, clínicas o tiendas que necesitan estar en Google y que les llamen.",
    features: ["Hasta 5 secciones", "Adaptada a móvil", "Formulario de contacto", "Ficha de Google y mapa", "Lista en 2–3 semanas"],
  },
  {
    id: "reservas",
    name: "Web con reservas",
    price: "750",
    forWho: "Negocios que dan citas o mesas y quieren dejar de hacerlo por teléfono.",
    features: ["Todo lo de la web para tu negocio", "Reservas online por día y hora", "Avisos por email de cada reserva", "Panel para ver tu agenda"],
    featured: true,
  },
  {
    id: "tienda",
    name: "Tienda online",
    price: "1.200",
    forWho: "Marcas que quieren vender sus productos por internet.",
    features: ["Catálogo y fichas de producto", "Carrito y pago con tarjeta o Apple Pay", "Gestión de pedidos y stock", "Envíos y devoluciones"],
  },
];

export const maintenance = { price: "25", text: "Cambios, copias de seguridad, actualizaciones y dominio." };

export type Extra = {
  id: string;
  name: string;
  tech: "QR" | "NFC" | "QR + NFC" | "Enlace";
  text: string;
  price: string; // texto libre: "desde 150 €", "35 €/ud"…
};

// Servicios para locales físicos. Precios orientativos sin IVA: cámbialos a tu gusto.
export const extras: Extra[] = [
  { id: "carta", name: "Carta digital", tech: "QR", text: "Tu carta en el móvil del cliente, con fotos, idiomas y alérgenos. La cambias tú cuando quieras, sin reimprimir.", price: "desde 150 € + 10 €/mes" },
  { id: "resenas", name: "Placa de reseñas", tech: "QR + NFC", text: "Para el mostrador o la mesa: el cliente acerca el móvil y se abre directamente la página para dejar su reseña en Google.", price: "35 € por placa" },
  { id: "reservas", name: "QR de reservas", tech: "QR", text: "En la puerta o el escaparate. Reservan o piden cita aunque el local esté cerrado.", price: "desde 40 €" },
  { id: "tarjeta", name: "Tarjeta de visita NFC", tech: "NFC", text: "Al acercarla a un móvil se guarda tu contacto o se abre tu web. Ideal para profesionales y equipos.", price: "25 € por tarjeta" },
  { id: "wifi", name: "WiFi en la mesa", tech: "QR", text: "Tus clientes se conectan al WiFi escaneando un código, sin dictar contraseñas.", price: "5 € por unidad" },
];

export const linkService = {
  name: "Enlaces que puedes cambiar",
  text: "Todos los QR y NFC apuntan a una dirección tuya. Si cambias la carta o la oferta, se actualiza sin reimprimir nada, y ves cuántas veces los escanean.",
  price: "incluido en el mantenimiento",
};

export type Pack = { id: string; name: string; price: string; items: string[] };

export const packs: Pack[] = [
  { id: "pack-restaurante", name: "Pack Restaurante", price: "650", items: ["Web para tu negocio", "Carta digital con QR", "2 placas de reseñas", "QR de WiFi para mesas"] },
  { id: "pack-clinica", name: "Pack Clínica", price: "850", items: ["Web con reservas", "QR de citas para la puerta", "3 tarjetas de visita NFC", "1 placa de reseñas"] },
];

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
