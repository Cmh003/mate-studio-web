import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Logo from "@/components/Logo";
import DemoView from "@/components/demos";
import { demoBySlug, demos } from "@/lib/demos";

export const dynamicParams = false;

export function generateStaticParams() {
  return demos.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const demo = demoBySlug(slug);
  if (!demo) return {};
  return {
    title: `${demo.business} · Demo de Mate Studio`,
    description: demo.description,
    // Son negocios de ejemplo: mejor que no aparezcan en Google como si fueran reales
    robots: { index: false, follow: true },
  };
}

export default async function DemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const demo = demoBySlug(slug);
  if (!demo) notFound();

  return (
    <>
      <div className="demo-bar">
        <a href="/#demos" aria-label="Volver a Mate Studio">
          <Logo size={24} />
          <span className="label">Demo hecha por Mate Studio</span>
        </a>
        <nav className="others" aria-label="Otras demos">
          {demos.map((d) => (
            <a key={d.slug} href={`/demos/${d.slug}`} aria-current={d.slug === demo.slug ? "page" : undefined}>
              {d.label}
            </a>
          ))}
        </nav>
        <a href="/#contacto" className="cta">
          Quiero una así
        </a>
      </div>
      <main style={{ minHeight: "100vh" }}>
        <DemoView slug={demo.slug} />
      </main>
    </>
  );
}
