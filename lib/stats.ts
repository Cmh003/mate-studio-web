import "server-only";
import { demos } from "./demos";
import { db, ensureSchema } from "./db";
import { extras, packs, plans, projects } from "./site";

export type Row = { name: string; n: number };
export type Day = { day: string; views: number; visitors: number; future?: boolean };
export type Lead = { id: string; ts: string; need: string | null; contact: string; idea: string; status: string };

export type MonthStats = {
  month: string;
  label: string;
  views: number;
  visitors: number;
  leads: number;
  conversion: number | null;
  prev: { label: string; views: number; visitors: number; leads: number };
  daily: Day[];
  pages: Row[];
  sources: Row[];
  devices: Row[];
  events: Row[];
  leadList: Lead[];
};

export const LEAD_STATUSES = ["nueva", "respondida", "cliente", "descartada"] as const;

const TZ = "Europe/Madrid";

export function currentMonth(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit" }).format(new Date()).slice(0, 7);
}

export function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(month: string): string {
  const s = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const validMonth = (m: string | undefined | null): m is string => !!m && /^\d{4}-(0[1-9]|1[0-2])$/.test(m);

// Nombres legibles para los eventos que se registran con data-track
export function eventLabel(name: string): string {
  const [kind, id] = name.split(":");
  const plan = plans.find((p) => p.id === id);
  const extra = extras.find((e) => e.id === id);
  const demo = demos.find((d) => d.slug === id);
  const project = projects.find((p) => p.id === id);
  const pack = packs.find((p) => p.id === name);
  if (kind === "precio" && plan) return `Pedir presupuesto · ${plan.name}`;
  if (kind === "local" && extra) return `Lo quiero · ${extra.name}`;
  if (kind === "demo" && demo) return `Demo vista · ${demo.label}`;
  if (kind === "proyecto" && project) return `Proyecto abierto · ${project.name}`;
  if (pack) return `Lo quiero · ${pack.name}`;
  const fixed: Record<string, string> = {
    formulario_enviado: "Formulario enviado",
    cta_cabecera: "Botón «Cuéntame tu idea»",
    dibujar_marca: "Probó «Dibuja tu marca»",
    demo_completa: "Abrió una demo a pantalla completa",
  };
  return fixed[name] ?? name;
}

export async function getMonthStats(month: string): Promise<MonthStats> {
  await ensureSchema();
  const sql = db();
  const start = `${month}-01`;
  const prevMonth = shiftMonth(month, -1);
  const prevStart = `${prevMonth}-01`;

  // Límites del mes en hora de Madrid
  const range = (s: string) => sql`ts >= (${s}::date)::timestamp at time zone ${TZ} and ts < ((${s}::date + interval '1 month'))::timestamp at time zone ${TZ}`;

  const daily = await sql<Day[]>`
    with d as (
      select generate_series(${start}::date, (${start}::date + interval '1 month' - interval '1 day')::date, interval '1 day')::date as day
    ), e as (
      select (ts at time zone ${TZ})::date as day,
             count(*) as views,
             count(distinct visitor) as visitors
      from events where kind = 'view' and ${range(start)}
      group by 1
    )
    select to_char(d.day, 'YYYY-MM-DD') as day, coalesce(e.views, 0)::int as views, coalesce(e.visitors, 0)::int as visitors
    from d left join e using (day) order by d.day`;

  const totals = async (s: string) => {
    const [r] = await sql<{ views: number; visitors: number; leads: number }[]>`
      select
        (select count(*) from events where kind = 'view' and ${range(s)})::int as views,
        (select coalesce(sum(v), 0) from (
           select count(distinct visitor) as v from events where kind = 'view' and ${range(s)}
           group by (ts at time zone ${TZ})::date) x)::int as visitors,
        (select count(*) from leads where ${range(s)})::int as leads`;
    return r;
  };

  const [cur, prev, pages, sources, devices, events, leadList] = await Promise.all([
    totals(start),
    totals(prevStart),
    sql<Row[]>`select name, count(*)::int as n from events where kind = 'view' and ${range(start)} group by name order by n desc limit 8`,
    sql<Row[]>`select coalesce(source, 'Directo') as name, count(*)::int as n from events where kind = 'view' and entry and ${range(start)} group by 1 order by n desc limit 8`,
    sql<Row[]>`select device as name, count(distinct (visitor, (ts at time zone ${TZ})::date))::int as n from events where kind = 'view' and ${range(start)} group by 1 order by n desc`,
    sql<Row[]>`select name, count(*)::int as n from events where kind = 'event' and ${range(start)} group by name order by n desc limit 12`,
    sql<Lead[]>`select id, to_char(ts at time zone ${TZ}, 'YYYY-MM-DD HH24:MI') as ts, need, contact, idea, status from leads where ${range(start)} order by ts desc limit 100`,
  ]);

  return {
    month,
    label: monthLabel(month),
    views: cur.views,
    visitors: cur.visitors,
    leads: cur.leads,
    conversion: cur.visitors > 0 ? cur.leads / cur.visitors : null,
    prev: { label: monthLabel(prevMonth), ...prev },
    // Los días que aún no han llegado no se dibujan (si no, la línea caería a cero)
    daily: daily.map((d) => (d.day > today() ? { ...d, future: true } : d)),
    pages,
    sources,
    devices,
    events: events.map((e) => ({ name: eventLabel(e.name), n: e.n })),
    leadList,
  };
}

// Limpieza periódica (RGPD: no guardar datos más tiempo del necesario)
export async function purgeOldData() {
  await ensureSchema();
  const sql = db();
  await sql`delete from events where ts < now() - interval '25 months'`;
  await sql`delete from leads where ts < now() - interval '24 months' and status <> 'cliente'`;
  await sql`delete from login_attempts where ts < now() - interval '1 day'`;
}
