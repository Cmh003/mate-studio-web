import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/panel"] }],
    sitemap: `${baseUrl()}/sitemap.xml`,
  };
}
