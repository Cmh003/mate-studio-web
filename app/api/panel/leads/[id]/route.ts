import { requireAdminApi } from "@/lib/auth";
import { db, ensureSchema } from "@/lib/db";
import { LEAD_STATUSES } from "@/lib/stats";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ error: "Id no válido" }, { status: 400 });
  const body = (await req.json().catch(() => ({}))) as { status?: string };
  if (!body.status || !(LEAD_STATUSES as readonly string[]).includes(body.status)) {
    return Response.json({ error: "Estado no válido" }, { status: 400 });
  }
  await ensureSchema();
  const rows = await db()`update leads set status = ${body.status} where id = ${id} returning id`;
  if (!rows.length) return Response.json({ error: "No existe" }, { status: 404 });
  return Response.json({ ok: true });
}
