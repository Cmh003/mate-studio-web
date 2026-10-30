import { createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import { ensureSchema, db, hasDb } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// Registro de visitas y eventos, sin cookies y sin guardar la IP.
// El "visitante" es un resumen anónimo (hash) que cambia cada día, así que no se puede seguir a nadie.

export const runtime = "nodejs";

const BOTS = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|headless|lighthouse|pingdom|monitor|curl|wget|python|axios/i;
const EVENT_NAME = /^[a-z0-9_:\-]{1,60}$/;

function sourceFrom(referrer: string, utm: string, ownHost: string): string | null {
  if (utm) return utm.toLowerCase().replace(/[^a-z0-9_\-. ]/g, "").slice(0, 40) || null;
  if (!referrer) return "Directo";
  let host = "";
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return "Directo";
  }
  if (!host || host === ownHost) return null;
  if (/google\./.test(host)) return "Google";
  if (/bing\.|duckduckgo|ecosia|yahoo/.test(host)) return "Otros buscadores";
  if (/instagram/.test(host)) return "Instagram";
  if (/tiktok/.test(host)) return "TikTok";
  if (/facebook|fb\.|messenger/.test(host)) return "Facebook";
  if (/linkedin|lnkd/.test(host)) return "LinkedIn";
  if (/whatsapp|wa\.me/.test(host)) return "WhatsApp";
  if (host === "t.co" || /twitter|x\.com/.test(host)) return "X";
  return host.slice(0, 60);
}

function deviceFrom(ua: string): string {
  if (/iPad|Tablet/i.test(ua)) return "Tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "Móvil";
  return "Ordenador";
}

export async function POST(req: Request) {
  const done = () => new Response(null, { status: 204 });
  if (!hasDb()) return done();

  const h = await headers();
  const ua = h.get("user-agent") ?? "";
  // Respeta "No rastrear", ignora robots y no cuenta tus propias visitas al panel
  if (h.get("dnt") === "1" || h.get("sec-gpc") === "1" || !ua || BOTS.test(ua)) return done();
  const c = await cookies();
  if (await verifySessionToken(c.get(SESSION_COOKIE)?.value)) return done();

  let body: { k?: string; n?: string; r?: string; s?: string; e?: boolean };
  try {
    const text = await req.text();
    if (text.length > 2000) return done();
    body = JSON.parse(text);
  } catch {
    return done();
  }

  const kind = body.k === "view" ? "view" : body.k === "event" ? "event" : null;
  if (!kind) return done();
  let name = String(body.n ?? "");
  if (kind === "view") {
    name = name.split("?")[0].split("#")[0].slice(0, 120);
    if (!name.startsWith("/") || name.startsWith("/panel") || name.startsWith("/api")) return done();
  } else if (!EVENT_NAME.test(name)) {
    return done();
  }

  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const day = new Date().toISOString().slice(0, 10);
  const salt = createHash("sha256").update(`${process.env.SESSION_SECRET ?? "mate"}|${day}`).digest("hex");
  const visitor = createHash("sha256").update(`${salt}|${ip}|${ua}`).digest("hex").slice(0, 16);
  const ownHost = (h.get("host") ?? "").replace(/^www\./, "");
  const entry = kind === "view" && body.e === true;
  const source = entry ? sourceFrom(String(body.r ?? ""), String(body.s ?? ""), ownHost) : null;

  try {
    await ensureSchema();
    await db()`insert into events (kind, name, entry, source, device, visitor)
               values (${kind}, ${name}, ${entry}, ${source}, ${deviceFrom(ua)}, ${visitor})`;
  } catch (err) {
    console.error("[estadísticas] no se pudo guardar", err);
  }
  return done();
}
