import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // le service worker doit toujours être revérifié pour recevoir les mises à jour
  async headers() {
    return [{ source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }, { key: "Service-Worker-Allowed", value: "/" }] }];
  },
};

export default nextConfig;
