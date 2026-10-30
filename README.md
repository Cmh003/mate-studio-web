# Mate Studio — web

Web de Mate Studio hecha con **Next.js 15 + TypeScript**, sin librerías de animación: el logo 3D se dibuja con un shader WebGL propio.

## Qué tiene

- **Intro**: el punto lima respira mientras carga.
- **Historia con scroll** (`components/Scene3D.tsx` + `lib/shader.ts`): el punto dibuja la "m" en 3D, salta a su sitio y el logo gira. Punto → Línea → Forma → Marca.
- **"Ahora, la tuya"** (`components/BrandDraw.tsx`): el visitante escribe su negocio y el punto lo dibuja en relieve.
- **Constelación de trabajos** (`components/Constellation.tsx`): cada proyecto es un punto que se expande a pantalla completa. Se cierra con la X o con Escape.
- **Contacto** (`components/Contact.tsx` + `app/api/contact/route.ts`): formulario con envío por email (Resend) y enlaces a WhatsApp, email e Instagram.
- **Easter egg** (`components/EasterEgg.tsx`): doble clic en cualquier sitio y el punto se escapa y rebota por la pantalla.
- Respeta `prefers-reduced-motion` y funciona sin WebGL (muestra un punto lima estático).

## Empezar

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Tus datos

Todo lo editable está en **`lib/site.ts`**:

- `contact`: email, WhatsApp, Instagram y enlace para agendar llamadas. **Cada canal vacío desaparece de la web**; si están todos vacíos, el contacto se hace solo por el formulario.
- `legal`: tu nombre, NIF, dirección y email para el **aviso legal** y la **política de privacidad** (obligatorios en España). Las páginas son plantillas orientativas: revísalas antes de publicar.
- `plans` y `maintenance`: los precios orientativos (sin IVA).
- `chapters` y `projects`: textos de la historia y del portfolio.

## Formulario de contacto

Sin configurar nada, el formulario funciona pero los mensajes solo aparecen en los logs del servidor. Para recibirlos por email:

1. Crea una cuenta en https://resend.com (plan gratuito). No hace falta dominio para empezar: usa tu email personal en `CONTACT_TO`.
2. Copia `.env.example` a `.env.local` y rellena `RESEND_API_KEY`, `CONTACT_TO` y `CONTACT_FROM`.
3. En Vercel, añade esas mismas variables en *Settings → Environment Variables*.

## Publicar en Vercel

1. Sube la carpeta a un repositorio de GitHub.
2. En https://vercel.com, *Add New → Project* e importa el repositorio. No hace falta cambiar nada.
3. En *Settings → Domains*, añade tu dominio y sigue las instrucciones de DNS de tu registrador.

## Estructura

```
app/
  layout.tsx          Metadatos, fuentes e iconos
  page.tsx            Orden de las secciones
  globals.css         Estilos y paleta (variables en :root)
  api/contact/        Endpoint del formulario
components/           Cada pieza de la web
lib/
  site.ts             Datos editables
  shader.ts           Escena 3D del logo
  story.ts            Avance de la historia con el scroll
public/               Favicons y logos en SVG
```

## Qué más incluye

- **Precios** (`components/Pricing.tsx`): al pulsar "Pedir presupuesto", el formulario se abre con esa opción marcada.
- **Textos legales**: `/aviso-legal` y `/privacidad`, enlazados en el pie y en el formulario (con casilla de aceptación).
- **Fuentes alojadas en la propia web** (`public/fonts`, `app/fonts.css`): no se conecta con Google, así que no hace falta banner de cookies.
- **Vista previa al compartir** (`app/opengraph-image.tsx`), `sitemap.xml`, `robots.txt` y datos estructurados de negocio local.
- **Página 404** propia (`app/not-found.tsx`).
- **Para tu local: QR y NFC** (`components/LocalSection.tsx`): servicios, packs y una vista previa interactiva. El QR de la tarjeta es real y abre la carta de la demo del restaurante. Productos, precios y packs se editan en `lib/site.ts` (`extras`, `linkService`, `packs`).

## Rendimiento

El shader se pinta a resolución reducida (máx. 1,25×) y deja de dibujarse cuando la historia sale de pantalla. Si en móviles antiguos va justo, baja el límite de `dpr` en `components/Scene3D.tsx`.
