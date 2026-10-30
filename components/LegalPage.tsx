import Logo from "./Logo";

export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="legal">
      <header className="legal-top">
        <a href="/" className="brand" aria-label="Volver a Mate Studio">
          <Logo />
          <span>
            <strong>mate</strong>
            <span className="muted"> studio</span>
          </span>
        </a>
        <a href="/" className="pill">
          Volver a la web
        </a>
      </header>
      <main className="legal-body">
        <p className="mono lime">Legal</p>
        <h1>{title}</h1>
        <p className="mono tiny muted">Última actualización: {updated}</p>
        {children}
      </main>
    </div>
  );
}
