import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { site } from "@/lib/site";
import { baseUrl } from "@/lib/url";

export const metadata: Metadata = { title: `Aviso legal · ${site.name}`, alternates: { canonical: "/aviso-legal" } };

// Plantilla orientativa. Rellena los datos de lib/site.ts (site.legal) y revísala antes de publicar.
export default function AvisoLegal() {
  const { owner, nif, address, email } = site.legal;
  return (
    <LegalPage title="Aviso legal" updated="octubre de 2026">
      <h2>Quién está detrás de esta web</h2>
      <p>En cumplimiento de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), estos son los datos del titular:</p>
      <ul>
        <li>Titular: {owner}</li>
        <li>NIF: {nif}</li>
        <li>Domicilio: {address}</li>
        <li>Email: {email}</li>
        <li>Actividad: diseño y desarrollo de páginas web</li>
        <li>Web: {baseUrl().replace(/^https?:\/\//, "")}</li>
      </ul>

      <h2>Uso de la web</h2>
      <p>Al navegar por esta web aceptas usarla de forma lícita y no dañar su funcionamiento ni el de los equipos de otras personas.</p>

      <h2>Propiedad intelectual</h2>
      <p>
        Los textos, diseños, logotipos y código de esta web son propiedad de {owner} o se usan con permiso de sus autores. No se pueden copiar ni
        reutilizar con fines comerciales sin autorización por escrito.
      </p>
      <p>
        Los negocios que aparecen en las demos (Fisio Alameda, Casa Brasa, Estudio Lola y NORTE) son inventados y sirven solo como ejemplo de trabajo.
        Las tipografías se usan bajo la licencia SIL Open Font License.
      </p>

      <h2>Responsabilidad</h2>
      <p>Hago lo posible para que la información de esta web sea correcta y esté disponible, pero no puedo garantizar que no haya errores o interrupciones.</p>

      <h2>Legislación aplicable</h2>
      <p>Este aviso se rige por la legislación española. Para cualquier conflicto se aplicarán las normas sobre competencia de los juzgados vigentes.</p>
    </LegalPage>
  );
}
