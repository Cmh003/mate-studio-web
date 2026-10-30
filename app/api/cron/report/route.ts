import { timingSafeEqual } from "node:crypto";
import { hasDb } from "@/lib/db";
import { sendReport } from "@/lib/report";
import { currentMonth, getMonthStats, purgeOldData, shiftMonth } from "@/lib/stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lo llama Vercel Cron el día 1 de cada mes (ver vercel.json) con
// "Authorization: Bearer <CRON_SECRET>". Envía el informe del mes anterior y limpia datos viejos.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (!secret || secret.length < 16 || given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return new Response("Not found", { status: 404 });
  }
  if (!hasDb()) return Response.json({ ok: false, error: "Sin base de datos" }, { status: 500 });
  await purgeOldData();
  const result = await sendReport(await getMonthStats(shiftMonth(currentMonth(), -1)));
  return Response.json(result);
}
