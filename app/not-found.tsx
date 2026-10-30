import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="nf">
      <a href="/" className="brand nf-brand" aria-label="Mate Studio, inicio">
        <Logo />
        <span>
          <strong>mate</strong>
          <span className="muted"> studio</span>
        </span>
      </a>
      <div className="nf-body">
        <p className="mono lime">Error 404</p>
        <h1>
          Aquí no hay
          <br />
          ningún punto<span className="lime">.</span>
        </h1>
        <p className="lead">Esta página no existe o ha cambiado de dirección.</p>
        <a href="/" className="pill pill-lime tall">
          Volver al inicio
        </a>
      </div>
      <span className="nf-dot" aria-hidden="true" />
    </main>
  );
}
