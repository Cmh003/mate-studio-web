"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AREAS,
  SAMPLE,
  allItems,
  answersFromMetrics,
  emptyMetrics,
  scoreOf,
  topFixes,
  verdict,
  type Answers,
  type Business,
  type Metrics,
  type Status,
} from "@/lib/audit";
import { site } from "@/lib/site";

const STATUS_LABEL: Record<Status, string> = { ok: "Bien", warn: "Mejorable", bad: "Mal", na: "N/A" };
const ICON: Record<Exclude<Status, "na">, string> = { ok: "✓", warn: "!", bad: "✕" };
const DRAFT = "mate-audit-draft";

const today = () => new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date());
const blankBusiness = (): Business => ({ name: "", url: "", sector: "", city: "", contact: "", auditor: "Carlos · Mate Studio", date: today() });

function sample() {
  const auto = answersFromMetrics(SAMPLE.metrics, { https: true, viewport: false, title: true, meta: false });
  auto.title = { status: "warn", note: "Solo pone «Inicio»: no dice qué es ni dónde" };
  return { business: { ...SAMPLE.business, date: today() }, metrics: SAMPLE.metrics, answers: { ...auto, ...SAMPLE.manual } };
}

export default function AuditTool({ example }: { example: boolean }) {
  const [business, setBusiness] = useState<Business>(blankBusiness);
  const [metrics, setMetrics] = useState<Metrics>(emptyMetrics);
  const [answers, setAnswers] = useState<Answers>({});
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  // Carga el ejemplo o el borrador guardado en este navegador
  useEffect(() => {
    if (example) {
      const s = sample();
      setBusiness(s.business);
      setMetrics(s.metrics);
      setAnswers(s.answers);
      setSummary("La web tiene buena reputación detrás (más de 200 reseñas), pero en el móvil carga muy lenta y no deja reservar. Con tres cambios concretos, las visitas que ya llegan desde Google se convertirían en mesas reservadas.");
    } else {
      try {
        const raw = localStorage.getItem(DRAFT);
        if (raw) {
          const d = JSON.parse(raw);
          setBusiness({ ...blankBusiness(), ...d.business });
          setMetrics({ ...emptyMetrics, ...d.metrics });
          setAnswers(d.answers ?? {});
          setSummary(d.summary ?? "");
        }
      } catch {}
    }
    setReady(true);
  }, [example]);

  useEffect(() => {
    if (!ready || example) return;
    try {
      localStorage.setItem(DRAFT, JSON.stringify({ business, metrics, answers, summary }));
    } catch {}
  }, [ready, example, business, metrics, answers, summary]);

  const setAnswer = (id: string, patch: Partial<{ status: Status; note: string }>) =>
    setAnswers((a) => ({ ...a, [id]: { status: a[id]?.status ?? "na", note: a[id]?.note ?? "", ...patch } }));

  const analyze = async () => {
    if (!business.url) {
      setError("Escribe primero la dirección de la web.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/panel/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: business.url }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se ha podido analizar");
      setMetrics(json.metrics);
      setAnswers((a) => ({ ...a, ...answersFromMetrics(json.metrics, json.checks) }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se ha podido analizar");
    }
    setBusy(false);
  };

  const reset = () => {
    if (!window.confirm("¿Empezar una auditoría nueva? Se borrará la actual.")) return;
    setBusiness(blankBusiness());
    setMetrics(emptyMetrics);
    setAnswers({});
    setSummary("");
  };

  const total = useMemo(() => scoreOf(allItems(), answers), [answers]);
  const v = verdict(total);
  const fixes = useMemo(() => topFixes(answers), [answers]);
  const field = (k: keyof Business, label: string, type = "text", placeholder = "") => (
    <label className="au-field">
      {label}
      <input type={type} value={business[k]} placeholder={placeholder} onChange={(e) => setBusiness((b) => ({ ...b, [k]: e.target.value }))} />
    </label>
  );

  return (
    <div className="au">
      {/* ---------- Formulario (no se imprime) ---------- */}
      <div className="au-form">
        <section className="pn-card">
          <h2>1 · El negocio</h2>
          <div className="au-form">
            {field("name", "Nombre del negocio", "text", "Bar La Esquina")}
            <div className="au-row">
              {field("url", "Web", "url", "https://…")}
              {field("sector", "Sector", "text", "Restaurante")}
            </div>
            <div className="au-row">
              {field("city", "Ciudad", "text", "Leganés")}
              {field("contact", "Persona de contacto")}
            </div>
            <div className="au-tools">
              <button type="button" className="pn-btn" onClick={analyze} disabled={busy}>
                {busy ? "Analizando con Google… (~30 s)" : "Analizar la web"}
              </button>
              {error ? <span className="pn-err" role="alert">{error}</span> : <span className="pn-delta">«Analizar» rellena sola los puntos marcados como «auto»; el resto lo marcas tú.</span>}
            </div>
          </div>
        </section>

        <section className="pn-card">
          <h2>2 · Revisión punto por punto</h2>
          <div className="au-form">
            {AREAS.map((area) => {
              const s = scoreOf(area.items, answers);
              return (
                <details key={area.id} className="au-area" open={area.id === "velocidad"}>
                  <summary>
                    {area.name}
                    <span className="pn-delta">{s === null ? "—" : `${s}/100`}</span>
                  </summary>
                  {area.items.map((it) => {
                    const a = answers[it.id];
                    return (
                      <div key={it.id} className="au-item">
                        <div className="au-item-top">
                          <span>
                            {it.label} {it.auto ? <span className="au-auto">auto</span> : null}
                          </span>
                          <span className="au-seg" role="group" aria-label={it.label}>
                            {(Object.keys(STATUS_LABEL) as Status[]).map((st) => (
                              <button key={st} type="button" data-v={st} aria-pressed={a?.status === st} onClick={() => setAnswer(it.id, { status: st })}>
                                {STATUS_LABEL[st]}
                              </button>
                            ))}
                          </span>
                        </div>
                        <input aria-label={`Nota: ${it.label}`} placeholder="Nota para el informe (opcional)" value={a?.note ?? ""} onChange={(e) => setAnswer(it.id, { note: e.target.value })} />
                      </div>
                    );
                  })}
                </details>
              );
            })}
          </div>
        </section>

        <section className="pn-card">
          <h2>3 · Conclusión</h2>
          <label className="au-field">
            Resumen en dos frases para el dueño
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Qué está bien, qué le está costando clientes y qué propones." />
          </label>
        </section>
      </div>

      {/* ---------- Informe (lo que se imprime / PDF) ---------- */}
      <div className="au-sticky">
        <div className="au-tools no-print" style={{ marginBottom: 12 }}>
          <button type="button" className="pn-btn" onClick={() => window.print()}>
            Descargar PDF
          </button>
          {example ? (
            <a className="pn-btn pn-btn-ghost" href="/panel/auditoria">
              Hacer una real
            </a>
          ) : (
            <>
              <a className="pn-btn pn-btn-ghost" href="/panel/auditoria?ejemplo=1">
                Ver ejemplo
              </a>
              <button type="button" className="pn-btn pn-btn-ghost" onClick={reset}>
                Nueva
              </button>
            </>
          )}
        </div>

        <article className="au-sheet" aria-label="Vista previa del informe">
          <header className="au-sheet-head">
            <div className="au-sheet-brand">
              m<i aria-hidden /> Mate Studio
            </div>
            <div className="au-sheet-meta">
              Auditoría web gratuita
              <br />
              {business.date}
            </div>
          </header>

          <h2>{business.name || "Nombre del negocio"}</h2>
          <p className="au-url">
            {business.url || "https://…"}
            {business.sector ? ` · ${business.sector}` : ""}
            {business.city ? ` · ${business.city}` : ""}
          </p>

          <div className="au-score au-avoid">
            <div className="au-ring" style={{ ["--v" as string]: total ?? 0, ["--c" as string]: v.color }}>
              <span>{total ?? "—"}</span>
            </div>
            <div>
              <strong style={{ color: v.color }}>{v.title}</strong>
              <p>{summary || v.text}</p>
            </div>
          </div>

          <h3>Datos de Google (móvil)</h3>
          <div className="au-metrics au-avoid">
            <div className="au-metric">
              <b>{metrics.performance ?? "—"}</b>
              <span>Rendimiento /100</span>
            </div>
            <div className="au-metric">
              <b>{metrics.lcp === null ? "—" : `${metrics.lcp.toFixed(1).replace(".", ",")} s`}</b>
              <span>Carga del contenido</span>
            </div>
            <div className="au-metric">
              <b>{metrics.seo ?? "—"}</b>
              <span>SEO /100</span>
            </div>
            <div className="au-metric">
              <b>{metrics.accessibility ?? "—"}</b>
              <span>Accesibilidad /100</span>
            </div>
          </div>

          <h3>Nota por áreas</h3>
          <div className="au-areas au-avoid">
            {AREAS.map((area) => {
              const s = scoreOf(area.items, answers);
              return (
                <div key={area.id} className="au-area-row">
                  <span>{area.name}</span>
                  <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="au-meter" aria-hidden>
                      <i style={{ width: `${s ?? 0}%`, background: verdict(s).color }} />
                    </span>
                    <b style={{ width: 28, textAlign: "right" }}>{s ?? "—"}</b>
                  </span>
                </div>
              );
            })}
          </div>

          {fixes.length ? (
            <div className="au-avoid">
              <h3>Lo primero que arreglaríamos</h3>
              <ol className="au-top3">
                {fixes.map((it) => (
                  <li key={it.id}>
                    <span>
                      <b>{it.label}</b>
                      {it.why} <em>{it.fix}</em>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {AREAS.map((area) => {
            const rows = area.items.filter((it) => answers[it.id] && answers[it.id].status !== "na");
            if (!rows.length) return null;
            return (
              <div key={area.id} className="au-avoid">
                <h3>{area.name}</h3>
                <ul className="au-list">
                  {rows.map((it) => {
                    const a = answers[it.id];
                    const st = a.status as Exclude<Status, "na">;
                    return (
                      <li key={it.id}>
                        <span className={`au-ic ${st}`} aria-label={STATUS_LABEL[st]}>
                          {ICON[st]}
                        </span>
                        <span>
                          {it.label}
                          {a.note ? <small>{a.note}</small> : null}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}

          <div className="au-cta au-avoid">
            <span>
              <b>¿Lo arreglamos?</b>
              Te preparo un presupuesto cerrado para estos puntos, sin compromiso.
            </span>
            <span style={{ textAlign: "right" }}>
              {business.auditor}
              <br />
              {site.contact.email || site.url.replace(/^https?:\/\//, "")}
            </span>
          </div>
          <p className="au-sheet-foot">
            Datos medidos con Google PageSpeed Insights en versión móvil el {business.date}. Los resultados pueden variar ligeramente entre mediciones. Informe preparado por Mate Studio.
          </p>
        </article>
      </div>
    </div>
  );
}
