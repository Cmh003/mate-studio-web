import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Logo from "@/components/Logo";
import LoginForm from "@/components/panel/LoginForm";
import { isAdmin, totpRequired } from "@/lib/auth";
import { panelEnabled } from "@/lib/session";
import "../panel.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Acceso", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (!panelEnabled()) notFound();
  if (await isAdmin()) redirect("/panel");
  return (
    <main className="pn-login">
      <div className="pn-login-card">
        <Logo size={44} />
        <h1>Panel privado</h1>
        <LoginForm needsCode={totpRequired()} />
      </div>
    </main>
  );
}
