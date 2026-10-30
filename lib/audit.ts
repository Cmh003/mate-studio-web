// Plantilla de auditoría web para negocios locales.
// Se comparte entre el panel (cliente) y la API que consulta PageSpeed.

export type Status = "ok" | "warn" | "bad" | "na";

export type Item = {
  id: string;
  label: string;
  why: string; // por qué le importa al dueño del negocio (sale en el informe)
  fix: string; // qué haríamos nosotros
  weight: number; // 1 = normal, 2 = importante, 3 = crítico
  auto?: boolean; // se rellena solo con «Analizar»
};

export type Area = { id: string; name: string; items: Item[] };

export const AREAS: Area[] = [
  {
    id: "velocidad",
    name: "Velocidad",
    items: [
      { id: "perf", label: "Puntuación de rendimiento en móvil", why: "La mitad de la gente abandona una web que tarda más de 3 segundos.", fix: "Optimizar imágenes, quitar scripts innecesarios y usar un hosting rápido.", weight: 3, auto: true },
      { id: "lcp", label: "Tiempo hasta ver el contenido principal (LCP)", why: "Es lo que el cliente percibe como «la web carga».", fix: "Comprimir la imagen principal y cargarla primero.", weight: 2, auto: true },
      { id: "img", label: "Imágenes optimizadas y de buen tamaño", why: "Las fotos pesadas son la causa nº 1 de webs lentas.", fix: "Convertir a WebP/AVIF y servir el tamaño justo para cada pantalla.", weight: 1 },
    ],
  },
  {
    id: "movil",
    name: "Móvil",
    items: [
      { id: "viewport", label: "Se adapta a la pantalla del móvil", why: "Más del 70 % de las visitas de un negocio local llegan desde el móvil.", fix: "Diseño adaptable pensado primero para móvil.", weight: 3, auto: true },
      { id: "tap", label: "Botones fáciles de pulsar con el dedo", why: "Si cuesta pulsar «Llamar» o «Reservar», el cliente se va.", fix: "Botones grandes y separados, con acción principal siempre visible.", weight: 1 },
      { id: "callnow", label: "Llamar o pedir cita con un toque", why: "En el móvil la gente quiere llamar o reservar, no leer.", fix: "Botón fijo de llamada / reserva en la parte inferior.", weight: 2 },
    ],
  },
  {
    id: "google",
    name: "Google",
    items: [
      { id: "seo", label: "Puntuación SEO técnica", why: "Indica si Google puede entender bien la web.", fix: "Corregir etiquetas, estructura de títulos y enlaces.", weight: 2, auto: true },
      { id: "title", label: "Título de la página claro", why: "Es el texto azul que aparece en Google: debe decir qué haces y dónde.", fix: "Título del tipo «Fisioterapia en Leganés · Nombre».", weight: 2, auto: true },
      { id: "meta", label: "Descripción para Google", why: "Es el texto gris bajo el título; si falta, Google pone cualquier cosa.", fix: "Escribir una descripción con servicio, zona y una llamada a la acción.", weight: 1, auto: true },
      { id: "gbp", label: "Ficha de Google Business completa", why: "Es lo primero que ven al buscar «cerca de mí».", fix: "Completar horarios, fotos, servicios y enlazar la web.", weight: 3 },
      { id: "reviews", label: "Reseñas recientes en Google", why: "El 90 % lee reseñas antes de ir a un negocio nuevo.", fix: "Placa NFC/QR de reseñas en el mostrador.", weight: 2 },
    ],
  },
  {
    id: "confianza",
    name: "Confianza",
    items: [
      { id: "https", label: "Conexión segura (HTTPS)", why: "Sin el candado, el navegador avisa de «web no segura».", fix: "Certificado SSL gratuito y redirección automática.", weight: 3, auto: true },
      { id: "legal", label: "Aviso legal, privacidad y cookies", why: "Es obligatorio en España (LSSI y RGPD) y evita multas.", fix: "Páginas legales adaptadas al negocio y banner de cookies correcto.", weight: 2 },
      { id: "contact", label: "Dirección, horario y teléfono visibles", why: "Es la información que más se busca en una web local.", fix: "Bloque de contacto con mapa en todas las páginas.", weight: 2 },
      { id: "updated", label: "Contenido actualizado", why: "Precios viejos o un «© 2019» transmiten abandono.", fix: "Revisar textos, precios y fotos; mantenimiento mensual.", weight: 1 },
    ],
  },
  {
    id: "conversion",
    name: "Conversión",
    items: [
      { id: "cta", label: "Acción principal clara (reservar, llamar, pedir)", why: "Si el visitante no sabe qué hacer, no hace nada.", fix: "Un botón principal visible sin hacer scroll.", weight: 3 },
      { id: "booking", label: "Reservas o pedidos online", why: "Reservar a las 23:00 sin llamar es lo que hoy espera el cliente.", fix: "Sistema de reservas integrado en la web.", weight: 2 },
      { id: "form", label: "Formulario de contacto que funciona", why: "Un formulario roto son clientes perdidos sin que te enteres.", fix: "Formulario corto, con aviso al móvil/email y protección antispam.", weight: 1 },
    ],
  },
  {
    id: "diseno",
    name: "Diseño",
    items: [
      { id: "first", label: "Se entiende qué haces en 5 segundos", why: "La primera impresión decide si el visitante se queda.", fix: "Titular claro, foto real del negocio y beneficio principal.", weight: 2 },
      { id: "photos", label: "Fotos propias y de calidad", why: "Las fotos de banco de imágenes restan confianza.", fix: "Sesión de fotos sencilla del local, equipo y producto.", weight: 1 },
      { id: "brand", label: "Imagen de marca coherente", why: "Colores y letras consistentes hacen que parezca un negocio serio.", fix: "Paleta y tipografías definidas aplicadas en toda la web.", weight: 1 },
    ],
  },
  {
    id: "accesibilidad",
    name: "Accesibilidad",
    items: [
      { id: "a11y", label: "Puntuación de accesibilidad", why: "Una web accesible la puede usar todo el mundo, también personas mayores.", fix: "Contraste suficiente, textos alternativos y navegación con teclado.", weight: 1, auto: true },
      { id: "bp", label: "Buenas prácticas técnicas", why: "Errores técnicos que pueden romper la web en algunos navegadores.", fix: "Actualizar librerías y corregir errores de consola.", weight: 1, auto: true },
    ],
  },
];

export type Answer = { status: Status; note: string };
export type Answers = Record<string, Answer>;

export type Business = { name: string; url: string; sector: string; city: string; contact: string; auditor: string; date: string };

export type Metrics = {
  performance: number | null;
  seo: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  lcp: number | null; // segundos
};

export const emptyMetrics: Metrics = { performance: null, seo: null, accessibility: null, bestPractices: null, lcp: null };

const POINTS: Record<Exclude<Status, "na">, number> = { ok: 1, warn: 0.5, bad: 0 };

export function scoreOf(items: Item[], answers: Answers): number | null {
  let total = 0;
  let got = 0;
  for (const it of items) {
    const a = answers[it.id];
    if (!a || a.status === "na") continue;
    total += it.weight;
    got += it.weight * POINTS[a.status];
  }
  return total ? Math.round((got / total) * 100) : null;
}

export const allItems = () => AREAS.flatMap((a) => a.items);

// Las 3 mejoras que más impacto tendrían: lo peor y más importante primero
export function topFixes(answers: Answers, n = 3): Item[] {
  return allItems()
    .filter((it) => answers[it.id] && (answers[it.id].status === "bad" || answers[it.id].status === "warn"))
    .sort((a, b) => {
      const pa = (answers[a.id].status === "bad" ? 2 : 1) * a.weight;
      const pb = (answers[b.id].status === "bad" ? 2 : 1) * b.weight;
      return pb - pa;
    })
    .slice(0, n);
}

export function verdict(score: number | null): { title: string; text: string; color: string } {
  if (score === null) return { title: "Sin evaluar", text: "Marca los puntos de la lista para obtener la nota.", color: "#999" };
  if (score >= 85) return { title: "Muy bien", text: "La web está en buena forma. Hay detalles que pulir para sacarle aún más partido.", color: "#3c8c2f" };
  if (score >= 65) return { title: "Mejorable", text: "Funciona, pero está perdiendo clientes por problemas que tienen solución sencilla.", color: "#9a7b00" };
  if (score >= 40) return { title: "Necesita trabajo", text: "Hay problemas importantes que hacen que muchos visitantes se vayan sin contactar.", color: "#c26a00" };
  return { title: "Urgente", text: "La web está frenando el negocio. Conviene rehacerla o corregir lo básico cuanto antes.", color: "#c9372c" };
}

// Traduce las métricas de PageSpeed a estados de la lista
export function answersFromMetrics(m: Metrics, checks: { https?: boolean; viewport?: boolean; title?: boolean; meta?: boolean }): Answers {
  const band = (v: number | null, ok: number, warn: number): Status | null => (v === null ? null : v >= ok ? "ok" : v >= warn ? "warn" : "bad");
  const out: Answers = {};
  const set = (id: string, s: Status | null, note: string) => {
    if (s) out[id] = { status: s, note };
  };
  set("perf", band(m.performance, 90, 50), m.performance === null ? "" : `${m.performance}/100 en móvil (Google PageSpeed)`);
  set("lcp", m.lcp === null ? null : m.lcp <= 2.5 ? "ok" : m.lcp <= 4 ? "warn" : "bad", m.lcp === null ? "" : `${m.lcp.toFixed(1).replace(".", ",")} s (lo ideal: menos de 2,5 s)`);
  set("seo", band(m.seo, 90, 70), m.seo === null ? "" : `${m.seo}/100`);
  set("a11y", band(m.accessibility, 90, 70), m.accessibility === null ? "" : `${m.accessibility}/100`);
  set("bp", band(m.bestPractices, 90, 70), m.bestPractices === null ? "" : `${m.bestPractices}/100`);
  if (checks.https !== undefined) set("https", checks.https ? "ok" : "bad", checks.https ? "Candado activo" : "La web no usa HTTPS");
  if (checks.viewport !== undefined) set("viewport", checks.viewport ? "ok" : "bad", checks.viewport ? "Adaptada a móvil" : "No está configurada para móvil");
  if (checks.title !== undefined) set("title", checks.title ? "ok" : "bad", checks.title ? "" : "Falta el título de la página");
  if (checks.meta !== undefined) set("meta", checks.meta ? "ok" : "bad", checks.meta ? "" : "Falta la descripción para Google");
  return out;
}

// Ejemplo ficticio para ver cómo queda el informe
export const SAMPLE = {
  business: { name: "Bar La Esquina", url: "https://bar-laesquina.example", sector: "Restaurante / bar", city: "Leganés", contact: "Lucía (encargada)", auditor: "Carlos · Mate Studio", date: "" } as Business,
  metrics: { performance: 38, seo: 72, accessibility: 81, bestPractices: 75, lcp: 6.4 } as Metrics,
  manual: {
    img: { status: "bad", note: "Fotos de la carta de 3–4 MB cada una" },
    tap: { status: "warn", note: "El menú se queda pequeño en móvil" },
    callnow: { status: "bad", note: "El teléfono solo aparece abajo del todo, sin enlace" },
    gbp: { status: "warn", note: "Ficha sin horario de verano ni fotos recientes" },
    reviews: { status: "ok", note: "4,4 ★ con 212 reseñas" },
    legal: { status: "bad", note: "No hay política de privacidad ni aviso de cookies" },
    contact: { status: "warn", note: "Falta el horario" },
    updated: { status: "bad", note: "La carta en PDF es de 2022" },
    cta: { status: "bad", note: "No hay ningún botón para reservar" },
    booking: { status: "bad", note: "Solo por teléfono" },
    form: { status: "na", note: "" },
    first: { status: "warn", note: "Portada con un carrusel lento de fotos" },
    photos: { status: "ok", note: "Buenas fotos del local" },
    brand: { status: "warn", note: "El logo de la web no es el del toldo" },
  } as Answers,
};
