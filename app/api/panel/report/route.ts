import { requireAdminApi } from "@/lib/auth";
import { sendReport } from "@/lib/report";
import { currentMonth, getMonthStats, validMonth } from "@/lib/stats";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const body = (await req.json().catch(() => ({}))) as { month?: string };
  const month = validMonth(body.month) ? body.month : currentMonth();
  const result = await sendReport(await getMonthStats(month));
  return Response.json(result, { status: result.ok ? 200 : 400 });
}
