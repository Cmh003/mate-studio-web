import "server-only";
import { createHash, createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { SESSION_COOKIE, panelEnabled, verifySessionToken } from "./session";

// ---------- Contraseña (scrypt) ----------
// Formato de ADMIN_PASSWORD_HASH: scrypt:N:r:p:sal:hash (lo genera `npm run panel:setup`)
export function verifyPassword(password: string): boolean {
  const stored = process.env.ADMIN_PASSWORD_HASH ?? "";
  const [algo, N, r, p, salt, hash] = stored.split(":");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = scryptSync(password, Buffer.from(salt, "base64url"), expected.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
    maxmem: 128 * Number(N) * Number(r) * 2,
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// ---------- Doble factor (TOTP, compatible con Google Authenticator) ----------
function base32Decode(input: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    value = (value << 5) | alphabet.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

function totpAt(secret: Buffer, counter: number): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", secret).update(msg).digest();
  const o = h[h.length - 1] & 0xf;
  const code = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(code % 1_000_000).padStart(6, "0");
}

export const totpRequired = () => Boolean(process.env.ADMIN_TOTP_SECRET);

export function verifyTotp(code: string): boolean {
  const secretB32 = process.env.ADMIN_TOTP_SECRET;
  if (!secretB32) return true;
  if (!/^\d{6}$/.test(code)) return false;
  const secret = base32Decode(secretB32);
  const step = Math.floor(Date.now() / 30000);
  // Acepta el código actual y el de 30 s antes/después (relojes un poco desajustados)
  return [-1, 0, 1].some((d) => {
    const a = Buffer.from(totpAt(secret, step + d));
    const b = Buffer.from(code);
    return timingSafeEqual(a, b);
  });
}

// ---------- Utilidades ----------
export function clientKey(ip: string): string {
  return createHash("sha256").update(`${ip}|${process.env.SESSION_SECRET}`).digest("hex").slice(0, 32);
}

export async function requestIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

// Segunda comprobación en cada página y ruta del panel (además del middleware)
export async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return verifySessionToken(c.get(SESSION_COOKIE)?.value);
}

export async function requireAdminPage() {
  if (!panelEnabled()) notFound();
  if (!(await isAdmin())) redirect("/panel/login");
}

export async function requireAdminApi(): Promise<Response | null> {
  if (!panelEnabled()) return new Response("Not found", { status: 404 });
  if (!(await isAdmin())) return Response.json({ error: "No autorizado" }, { status: 401 });
  return null;
}
