import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Révisions CM2",
    short_name: "CM2",
    description: "Dictées, conjugaison, grammaire, maths et géométrie pour réviser le CM2.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#6366f1",
    lang: "fr",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
