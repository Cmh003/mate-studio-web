import "server-only";
import { baseUrl } from "./url";
import type { MonthStats, Row } from "./stats";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const fmt = (n: number) => new Intl.NumberFormat("es-ES").format(n);

function delta(cur: number, prev: number): string {
  if (prev === 0) return cur > 0 ? "nuevo" : "=";
  const d = Math.round(((cur - prev) / prev) * 100);
  return d === 0 ? "=" : `${d > 0 ? "+" : ""}${d}%`;
}

function list(title: string, rows: Row[]): string {
  if (!rows.length) return "";
  return `<h3 style="font:600 14px system-ui;margin:24px 0 8px;color:#0c0c0e">${esc(title)}</h3>
  <table style="width:100%;border-collapse:collapse;font:14px system-ui">${rows
    .slice(0, 5)
    .map((r) => `<tr><td style="padding:6px 0;border-bottom:1px solid #eee">${esc(r.name)}</td><td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right">${fmt(r.n)}</td></tr>`)
    .join("")}</table>`;
}

// Informe mensual en HTML (compatible con clientes de correo: tablas y estilos en línea)
export function reportHtml(s: MonthStats): string {
  const conv = s.conversion === null ? "—" : `${(s.conversion * 100).toFixed(1).replace(".", ",")}%`;
  const kpi = (label: string, value: string, d: string) =>
    `<td style="padding:12px;background:#f6f6f3;border-radius:8px;width:33%"><div style="font:12px system-ui;color:#666">${label}</div><div style="font:700 26px system-ui;color:#0c0c0e">${value}</div><div style="font:12px system-ui;color:#666">${d} vs ${esc(s.prev.label.toLowerCase())}</div></td>`;
  return `<!doctype html><html><body style="margin:0;background:#fff">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="font:700 20px system-ui;color:#0c0c0e">m<span style="color:#7da300">.</span> Mate Studio</div>
    <h1 style="font:700 24px system-ui;margin:16px 0 4px;color:#0c0c0e">Informe de ${esc(s.label.toLowerCase())}</h1>
    <p style="font:14px system-ui;color:#555;margin:0 0 16px">Resumen de lo que ha pasado en tu web este mes.</p>
    <table style="width:100%;border-collapse:separate;border-spacing:6px"><tr>
      ${kpi("Visitantes", fmt(s.visitors), delta(s.visitors, s.prev.visitors))}
      ${kpi("Visitas", fmt(s.views), delta(s.views, s.prev.views))}
      ${kpi("Solicitudes", fmt(s.leads), delta(s.leads, s.prev.leads))}
    </tr></table>
    <p style="font:14px system-ui;color:#333">Conversión: <strong>${conv}</strong> de los visitantes te escribió.</p>
    ${list("Páginas más vistas", s.pages)}
    ${list("De dónde llegan", s.sources)}
    ${list("Qué botones pulsan", s.events)}
    <p style="margin:28px 0"><a href="${baseUrl()}/panel?m=${s.month}" style="background:#0c0c0e;color:#c6f432;padding:12px 18px;border-radius:999px;text-decoration:none;font:600 14px system-ui">Abrir el panel completo</a></p>
    <p style="font:12px system-ui;color:#888">Estadísticas sin cookies: «visitantes» suma los visitantes únicos de cada día.</p>
  </div></body></html>`;
}

export async function sendReport(s: MonthStats): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.REPORT_TO || process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM ?? "Mate Studio <onboarding@resend.dev>";
  if (!key || !to) return { ok: false, error: "Configura RESEND_API_KEY y CONTACT_TO para recibir el informe por email." };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject: `Informe de ${s.label.toLowerCase()} · ${fmt(s.visitors)} visitantes, ${fmt(s.leads)} solicitudes`, html: reportHtml(s) }),
  });
  if (!res.ok) return { ok: false, error: `Resend respondió ${res.status}` };
  return { ok: true };
}
