import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import { LogoutButton } from "@/components/panel/PanelActions";
import { requireAdminPage } from "@/lib/auth";
import "../panel.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return (
    <div className="pn">
      <header className="pn-top">
        <Link href="/panel" className="pn-brand" aria-label="Panel">
          <Logo size={28} />
          <span>Panel</span>
        </Link>
        <nav className="pn-nav" aria-label="Secciones del panel">
          <Link href="/panel">Informe</Link>
          <Link href="/panel/auditoria">Auditoría</Link>
          <Link href="/" target="_blank">
            Ver la web ↗
          </Link>
        </nav>
        <LogoutButton />
      </header>
      {children}
    </div>
  );
}
