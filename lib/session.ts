// Sesión del panel: un token firmado con HMAC-SHA256 en una cookie HttpOnly.
// Usa solo Web Crypto, así funciona igual en el middleware (Edge) y en el servidor (Node).

export const SESSION_COOKIE = "mate_panel";
export const SESSION_HOURS = 12;

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): string {
  const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
  return atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
}

async function sign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(process.env.SESSION_SECRET ?? ""), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

// Comparación en tiempo constante (no revela cuántos caracteres coinciden)
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// El panel solo existe si está configurado. Si falta algo, todas sus rutas devuelven 404.
export function panelEnabled(): boolean {
  return Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32 && process.env.ADMIN_PASSWORD_HASH);
}

export async function createSessionToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const body = b64url(enc.encode(JSON.stringify({ sub: "admin", iat: now, exp: now + SESSION_HOURS * 3600 })));
  return `${body}.${await sign(body)}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token || !panelEnabled()) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [body, sig] = parts;
  if (!safeEqual(sig, await sign(body))) return false;
  try {
    const p = JSON.parse(fromB64url(body)) as { sub?: string; exp?: number };
    return p.sub === "admin" && typeof p.exp === "number" && p.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}
