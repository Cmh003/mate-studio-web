import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Propuestas para clientes: webs estáticas en public/propuestas/<cliente>, ocultas a Google
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        { source: "/propuestas/:cliente", destination: "/propuestas/:cliente/index.html" },
        { source: "/propuestas/:cliente/:path*", destination: "/propuestas/:cliente/:path*/index.html" },
      ],
      fallback: [],
    };
  },
  async headers() {
    return [{ source: "/propuestas/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default nextConfig;
