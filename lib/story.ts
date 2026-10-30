// Comunicación ligera entre componentes sin estado global:
// - el avance de la historia (0 → 1) según el scroll
// - si el punto se ha "escapado" (easter egg) y debe ocultarse en la escena 3D

export const STORY_SCREENS = 4.4; // cuántas pantallas de scroll dura la historia del logo
export const STORY_OFFSET = 0.6; // pantallas de portada antes de empezar

export function storyProgress(scrollY: number, viewport: number): number {
  const v = Math.max(1, viewport);
  return Math.min(1, Math.max(0, (scrollY / v - STORY_OFFSET) / STORY_SCREENS));
}

export const EGG_EVENT = "mate:egg";

export function setEggActive(active: boolean) {
  window.dispatchEvent(new CustomEvent<boolean>(EGG_EVENT, { detail: active }));
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Botones de precios → preseleccionan la opción en el formulario de contacto
export const PLAN_EVENT = "mate:plan";
