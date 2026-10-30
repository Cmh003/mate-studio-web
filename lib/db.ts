import postgres from "postgres";

// Conexión a PostgreSQL (en Vercel: Storage → Neon, que crea DATABASE_URL sola).
// Si no hay base de datos configurada, la web funciona igual: solo no se guardan estadísticas.

let client: postgres.Sql | null = null;
let schemaReady: Promise<void> | null = null;

const url = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

export const hasDb = () => Boolean(url());

export function db() {
  if (!client) {
    const u = url();
    const local = /@(localhost|127\.0\.0\.1)[:/]/.test(u);
    client = postgres(u, { ssl: local ? false : "require", max: 3, idle_timeout: 20, prepare: false });
  }
  return client;
}

// Crea las tablas la primera vez. Es idempotente: se puede llamar en cada petición.
export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = db();
      await sql`
        create table if not exists events (
          id bigserial primary key,
          ts timestamptz not null default now(),
          kind text not null,
          name text not null,
          entry boolean not null default false,
          source text,
          device text,
          visitor text
        )`;
      await sql`create index if not exists events_ts_idx on events (ts)`;
      await sql`
        create table if not exists leads (
          id uuid primary key default gen_random_uuid(),
          ts timestamptz not null default now(),
          need text,
          contact text not null,
          idea text not null,
          status text not null default 'nueva'
        )`;
      await sql`create index if not exists leads_ts_idx on leads (ts)`;
      await sql`
        create table if not exists login_attempts (
          key text not null,
          ts timestamptz not null default now()
        )`;
      await sql`create index if not exists login_attempts_idx on login_attempts (key, ts)`;
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}
