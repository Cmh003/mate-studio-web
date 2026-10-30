import AuditTool from "@/components/panel/AuditTool";
import { requireAdminPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ ejemplo?: string }> }) {
  await requireAdminPage();
  const { ejemplo } = await searchParams;
  return (
    <main className="pn-main" style={{ maxWidth: 1320 }}>
      <div className="pn-head no-print">
        <div>
          <p className="mono lime">Plantilla de auditoría</p>
          <h1>{ejemplo ? "Ejemplo: Bar La Esquina" : "Auditoría web"}</h1>
        </div>
      </div>
      <AuditTool example={Boolean(ejemplo)} />
    </main>
  );
}
