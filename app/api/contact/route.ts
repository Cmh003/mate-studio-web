import { NextResponse } from "next/server";

// Recibe el formulario de contacto. Si hay RESEND_API_KEY configurada, lo envía
// por email con Resend (https://resend.com). Si no, lo deja en los logs del servidor.

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON no válido" }, { status: 400 });
  }

  // Campo trampa para bots: si viene relleno, fingimos éxito y no hacemos nada
  if (clean(body.website, 200)) return NextResponse.json({ ok: true });

  const idea = clean(body.idea, 4000);
  const contact = clean(body.contact, 200);
  const need = clean(body.need, 100);
  if (!idea || !contact) {
    return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM ?? "Mate Studio <onboarding@resend.dev>";

  if (!key || !to) {
    console.log("[contacto] Nuevo mensaje (configura RESEND_API_KEY y CONTACT_TO para recibirlo por email):", { contact, need, idea });
    return NextResponse.json({ ok: true });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Nuevo proyecto desde la web${need ? ` (${need})` : ""} — ${contact}`,
      reply_to: contact.includes("@") ? contact : undefined,
      html: `<p><strong>Contacto:</strong> ${escape(contact)}</p>${need ? `<p><strong>Necesita:</strong> ${escape(need)}</p>` : ""}<p><strong>Idea:</strong></p><p>${escape(idea).replace(/\n/g, "<br>")}</p>`,
    }),
  });

  if (!res.ok) {
    console.error("[contacto] Error de Resend", res.status, await res.text());
    return NextResponse.json({ ok: false }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
