import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Política de privacidad · ${site.name}`, alternates: { canonical: "/privacidad" } };

// Plantilla orientativa basada en el RGPD y la LOPDGDD. Rellena site.legal y revísala antes de publicar.
export default function Privacidad() {
  const { owner, nif, address, email } = site.legal;
  return (
    <LegalPage title="Política de privacidad" updated="octubre de 2026">
      <p>Aquí te explico qué datos recojo en esta web, para qué y qué derechos tienes. En corto: solo uso tus datos para responderte.</p>

      <h2>Responsable</h2>
      <ul>
        <li>{owner}</li>
        <li>NIF: {nif}</li>
        <li>{address}</li>
        <li>{email}</li>
      </ul>

      <h2>Qué datos recojo</h2>
      <p>Los que escribes en el formulario de contacto: el teléfono o email que me dejes, qué necesitas y lo que me cuentes sobre tu proyecto.</p>
      <p>
        Además, la web cuenta las visitas de forma anónima para saber cuántas personas la ven, desde dónde llegan (por ejemplo, Google o TikTok), si
        usan móvil u ordenador y qué botones pulsan. No uso cookies para esto ni guardo tu dirección IP: con ella y tu navegador se calcula un código
        irreversible que cambia cada día, así que no es posible identificarte ni seguirte de un día a otro. Si tu navegador tiene activado «No
        rastrear» o «Global Privacy Control», no se cuenta tu visita.
      </p>

      <h2>Para qué los uso</h2>
      <p>Para responder a tu mensaje y, si te interesa, enviarte una propuesta. No los uso para enviarte publicidad ni los vendo a nadie.</p>

      <h2>Base legal</h2>
      <p>Tu consentimiento, que das al marcar la casilla del formulario. Puedes retirarlo cuando quieras.</p>

      <h2>Cuánto tiempo los guardo</h2>
      <p>
        Las solicitudes del formulario, un máximo de 24 meses, salvo que lleguemos a trabajar juntos: en ese caso, durante la relación profesional y
        los plazos que exija la ley (por ejemplo, fiscales). Las estadísticas anónimas de visitas se borran automáticamente a los 25 meses.
      </p>

      <h2>Quién más los ve</h2>
      <p>
        Nadie, salvo los proveedores técnicos que hacen funcionar la web y que tratan los datos por encargo mío: Vercel Inc. (alojamiento de la web), Neon
        (base de datos, alojada en la Unión Europea) y Resend (envío del formulario por email). Vercel y Resend están en Estados Unidos y se acogen al Marco de Privacidad de Datos UE-EE. UU. o a cláusulas
        contractuales tipo de la Comisión Europea.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Puedes pedirme acceder a tus datos, corregirlos, borrarlos, limitar su uso, oponerte a él o llevártelos a otro sitio. Escríbeme a {email}. Si
        crees que no he tratado bien tus datos, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).
      </p>

      <h2>Cookies</h2>
      <p>
        Esta web no usa cookies de seguimiento ni herramientas de terceros como Google Analytics. Las tipografías se cargan desde la propia web, sin conectar con servidores de terceros,
        así que no necesitas aceptar nada para navegar.
      </p>
    </LegalPage>
  );
}
