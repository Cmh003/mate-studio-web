import type { Metadata, Viewport } from "next";
import Analytics from "@/components/Analytics";
import { site } from "@/lib/site";
import { baseUrl } from "@/lib/url";
import "./fonts.css";
import "./globals.css";
import "./demos.css";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl()),
  title: `${site.name} — Webs a medida en ${site.city}`,
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${site.name} — Webs a medida`,
    description: site.description,
    url: "/",
    siteName: site.name,
    locale: "es_ES",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: `${site.name} — Webs a medida`, description: site.description },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon-180.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0C0C0E",
  width: "device-width",
  initialScale: 1,
};

// Datos estructurados para que Google entienda qué es y dónde trabaja el negocio
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  description: site.description,
  url: baseUrl(),
  image: `${baseUrl()}/opengraph-image`,
  areaServed: ["Leganés", "Getafe", "Alcorcón", "Fuenlabrada", "Madrid"],
  address: { "@type": "PostalAddress", addressLocality: "Leganés", addressRegion: "Madrid", addressCountry: "ES" },
  ...(site.contact.email ? { email: site.contact.email } : {}),
  priceRange: "€€",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preload" href="/fonts/space-grotesk.woff2" as="font" type="font/woff2" crossOrigin="" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
