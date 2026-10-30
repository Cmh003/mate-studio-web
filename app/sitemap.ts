import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/url";

// Las demos no se incluyen: son negocios inventados y están marcadas para que Google no las indexe.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = baseUrl();
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/aviso-legal`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
