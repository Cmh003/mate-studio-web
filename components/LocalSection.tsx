import QRCode from "qrcode";
import { extras, linkService, packs } from "@/lib/site";
import { baseUrl } from "@/lib/url";
import LocalPreview from "./LocalPreview";
import PackButton from "./PackButton";

// "Para tu local": servicios QR y NFC. El QR de la tarjeta es real y abre la carta de la demo.
export default async function LocalSection() {
  const target = `${baseUrl()}/demos/restaurante#rs-carta`;
  const qrSvg = await QRCode.toString(target, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#0C0C0E", light: "#00000000" },
  });

  return (
    <section id="local" className="section local">
      <div className="reveal head">
        <span className="mono lime">Para tu local</span>
        <h2 className="h2">
          Que te encuentren también en la mesa<span className="lime">.</span>
        </h2>
        <p className="lead">Códigos QR y tarjetas NFC que llevan a tus clientes a tu carta, tus reservas o tus reseñas con un gesto.</p>
      </div>

      <LocalPreview extras={extras} qrSvg={qrSvg} />

      <div className="local-link reveal">
        <span className="mono tiny lime">Enlace</span>
        <div>
          <strong>{linkService.name}</strong>
          <p>{linkService.text}</p>
        </div>
        <span className="local-price">{linkService.price}</span>
      </div>

      <div className="packs">
        {packs.map((p) => (
          <article key={p.id} className="pack reveal">
            <div className="pack-top">
              <h3>{p.name}</h3>
              <p className="plan-price">
                <span className="mono tiny muted">Desde</span>
                <strong>{p.price} €</strong>
              </p>
            </div>
            <ul>
              {p.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
            <PackButton need="local" note={`Me interesa el ${p.name}.`} />
          </article>
        ))}
      </div>
      <p className="mono tiny muted">Precios sin IVA · Material y programación incluidos</p>
    </section>
  );
}
