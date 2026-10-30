import { cookies } from "next/headers";
import { clientKey, requestIp, totpRequired, verifyPassword, verifyTotp } from "@/lib/auth";
import { db, ensureSchema, hasDb } from "@/lib/db";
import { SESSION_COOKIE, SESSION_HOURS, createSessionToken, panelEnabled } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 5;
const WINDOW_MIN = 15;
const memory = new Map<string, number[]>(); // por si no hay base de datos

async function tooMany(key: string): Promise<boolean> {
  if (hasDb()) {
    await ensureSchema();
    const [{ n }] = await db()<{ n: number }[]>`
      select count(*)::int as n from login_attempts
      where key = ${key} and ts > now() - make_interval(mins => ${WINDOW_MIN})`;
    return n >= MAX_ATTEMPTS;
  }
  const since = Date.now() - WINDOW_MIN * 60_000;
  const list = (memory.get(key) ?? []).filter((t) => t > since);
  memory.set(key, list);
  return list.length >= MAX_ATTEMPTS;
}

async function recordFail(key: string) {
  if (hasDb()) await db()`insert into login_attempts (key) values (${key})`;
  else memory.set(key, [...(memory.get(key) ?? []), Date.now()]);
}

async function clearFails(key: string) {
  if (hasDb()) await db()`delete from login_attempts where key = ${key} or ts < now() - interval '1 day'`;
  else memory.delete(key);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  if (!panelEnabled()) return new Response("Not found", { status: 404 });

  const key = clientKey(await requestIp());
  if (await tooMany(key)) {
    return Response.json({ error: `Demasiados intentos. Espera ${WINDOW_MIN} minutos.` }, { status: 429 });
  }

  let password = "";
  let code = "";
  try {
    const body = (await req.json()) as { password?: unknown; code?: unknown };
    password = typeof body.password === "string" ? body.password.slice(0, 200) : "";
    code = typeof body.code === "string" ? body.code.replace(/\s/g, "").slice(0, 6) : "";
  } catch {
    /* cuerpo no válido: cuenta como intento fallido */
  }

  // Se comprueban siempre las dos cosas, para no revelar cuál ha fallado
  const passOk = password.length > 0 && verifyPassword(password);
  const codeOk = verifyTotp(code);
  if (!passOk || !codeOk) {
    await recordFail(key);
    await sleep(700);
    return Response.json({ error: totpRequired() ? "Contraseña o código incorrectos." : "Contraseña incorrecta." }, { status: 401 });
  }

  await clearFails(key);
  const c = await cookies();
  c.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
  return Response.json({ ok: true });
}
