import BrandDraw from "@/components/BrandDraw";
import Constellation from "@/components/Constellation";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import DemoPicker from "@/components/DemoPicker";
import EasterEgg from "@/components/EasterEgg";
import Intro from "@/components/Intro";
import LocalSection from "@/components/LocalSection";
import Pricing from "@/components/Pricing";
import Stage from "@/components/Stage";
import { chapters } from "@/lib/site";

export default function Home() {
  return (
    <>
      <Intro />
      <Cursor />
      <EasterEgg />
      <Stage />

      <main className="content">
        <section id="inicio" className="screen hero">
          <p className="mono muted in" style={{ animationDelay: "1.5s" }}>
            Estudio web · Leganés, Madrid
          </p>
          <h1 className="h1 in" style={{ animationDelay: "1.6s" }}>
            Todo empieza
            <br />
            con un punto<span className="lime">.</span>
          </h1>
          <p className="lead in" style={{ animationDelay: "1.75s" }}>
            Diseño y desarrollo webs a medida que convierten una idea en una marca que se recuerda.
          </p>
          <p className="mono tiny muted scroll-hint in" style={{ animationDelay: "2s" }}>
            <span className="blink" aria-hidden="true" />
            Haz scroll
          </p>
        </section>

        <div id="proceso">
          {chapters.map((c) => (
            <section key={c.n} className="screen chapter">
              <div className="reveal chapter-text">
                <span className="mono lime">
                  {c.n} / 04 — {c.label}
                </span>
                <h2 className="h2">
                  {c.title}
                  <span className="lime">.</span>
                </h2>
                <p className="lead">{c.sub}</p>
              </div>
            </section>
          ))}
        </div>

        <BrandDraw />
        <DemoPicker />
        <Pricing />
        <LocalSection />
        <Constellation />
        <Contact />
      </main>
    </>
  );
}
