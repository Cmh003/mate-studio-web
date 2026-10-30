import Link from "next/link";
import DailyChart from "@/components/panel/DailyChart";
import LeadStatus from "@/components/panel/LeadStatus";
import { ReportButton } from "@/components/panel/PanelActions";
import { requireAdminPage } from "@/lib/auth";
import { hasDb } from "@/lib/db";
import { currentMonth, getMonthStats, shiftMonth, validMonth, type Row } from "@/lib/stats";

export const dynamic = "force-dynamic";

const fmt = (n: number) => new Intl.NumberFormat("es-ES").format(n);
const pct = (v: number) => `${(v * 100).toFixed(1).replace(".", ",")}%`;

function Delta({ cur, prev }: { cur: number; prev: number }) {
  if (prev === 0) return <span className="pn-delta">{cur > 0 ? "Primer mes con datos" : "Sin datos el mes anterior"}</span>;
  const d = Math.round(((cur - prev) / prev) * 100);
  const cls = d > 0 ? "up" : d < 0 ? "down" : "";
  return (
    <span className={`pn-delta ${cls}`}>
      {d > 0 ? "▲" : d < 0 ? "▼" : "="} {Math.abs(d)}% vs mes anterior
    </span>
  );
}

function Bars({ title, rows, empty }: { title: string; rows: Row[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <section className="pn-card">
      <h2>{title}</h2>
      {rows.length ? (
        <ul className="pn-bars">
          {rows.map((r) => (
            <li key={r.name}>
              <span className="pn-bar" style={{ width: `${(r.n / max) * 100}%` }} aria-hidden />
              <span className="pn-bar-name">{r.name}</span>
              <span className="pn-bar-n">{fmt(r.n)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="pn-empty">{empty}</p>
      )}
    </section>
  );
}

export default async function PanelPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  await requireAdminPage();
  const { m } = await searchParams;
  const now = currentMonth();
  const month = validMonth(m) && m <= now ? m : now;

  if (!hasDb()) {
    return (
      <main className="pn-main">
        <section className="pn-card">
          <h1>Falta conectar la base de datos</h1>
          <p>
            En Vercel, ve a <strong>Storage → Create Database → Neon</strong> (región Frankfurt), conéctala a este proyecto y vuelve a desplegar. Las visitas empezarán a contarse desde ese momento.
          </p>
        </section>
      </main>
    );
  }

  const s = await getMonthStats(month);
  const conversionPrev = s.prev.visitors > 0 ? s.prev.leads / s.prev.visitors : null;

  return (
    <main className="pn-main">
      <div className="pn-head">
        <div>
          <p className="mono lime">Informe mensual</p>
          <h1>{s.label}</h1>
        </div>
        <div className="pn-month">
          <Link href={`/panel?m=${shiftMonth(month, -1)}`} className="pn-btn pn-btn-ghost" aria-label="Mes anterior">
            ←
          </Link>
          {month < now ? (
            <Link href={`/panel?m=${shiftMonth(month, 1)}`} className="pn-btn pn-btn-ghost" aria-label="Mes siguiente">
              →
            </Link>
          ) : (
            <span className="pn-btn pn-btn-ghost is-off" aria-hidden>
              →
            </span>
          )}
          <ReportButton month={month} />
        </div>
      </div>

      <section className="pn-kpis" aria-label="Resumen del mes">
        <div className="pn-kpi">
          <span className="pn-kpi-label">Visitantes</span>
          <strong>{fmt(s.visitors)}</strong>
          <Delta cur={s.visitors} prev={s.prev.visitors} />
        </div>
        <div className="pn-kpi">
          <span className="pn-kpi-label">Visitas a páginas</span>
          <strong>{fmt(s.views)}</strong>
          <Delta cur={s.views} prev={s.prev.views} />
        </div>
        <div className="pn-kpi">
          <span className="pn-kpi-label">Solicitudes recibidas</span>
          <strong>{fmt(s.leads)}</strong>
          <Delta cur={s.leads} prev={s.prev.leads} />
        </div>
        <div className="pn-kpi">
          <span className="pn-kpi-label">Conversión</span>
          <strong>{s.conversion === null ? "—" : pct(s.conversion)}</strong>
          <span className="pn-delta">{conversionPrev === null ? "de cada visitante, cuántos escriben" : `${pct(conversionPrev)} el mes anterior`}</span>
        </div>
      </section>

      <section className="pn-card">
        <h2>Visitantes por día</h2>
        <DailyChart data={s.daily} />
      </section>

      <div className="pn-grid2">
        <Bars title="Páginas más vistas" rows={s.pages} empty="Todavía no hay visitas este mes." />
        <Bars title="De dónde llegan" rows={s.sources} empty="Aún no hay datos de procedencia." />
        <Bars title="Dispositivo" rows={s.devices} empty="Aún no hay datos." />
        <Bars title="Qué botones pulsan" rows={s.events} empty="Nadie ha pulsado botones este mes." />
      </div>

      <section className="pn-card">
        <h2>Solicitudes del formulario</h2>
        {s.leadList.length ? (
          <div className="pn-leads">
            {s.leadList.map((l) => (
              <article key={l.id} className="pn-lead">
                <header>
                  <time>{l.ts}</time>
                  {l.need ? <span className="pn-tag">{l.need}</span> : null}
                  <LeadStatus id={l.id} status={l.status} />
                </header>
                <p className="pn-lead-contact">
                  {l.contact.includes("@") ? <a href={`mailto:${l.contact}`}>{l.contact}</a> : l.contact}
                </p>
                <p className="pn-lead-idea">{l.idea}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="pn-empty">Este mes no ha llegado ninguna solicitud.</p>
        )}
      </section>

      <p className="pn-foot">
        Estadísticas sin cookies ni datos personales: «visitantes» suma los visitantes únicos de cada día (la misma persona en dos días cuenta dos veces). Tus propias visitas mientras tienes la sesión abierta no se cuentan.
      </p>
    </main>
  );
}
