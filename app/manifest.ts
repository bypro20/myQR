import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/seo/site-config";

export default function manifest(): MetadataRoute.Manifest {
  const site = getSiteConfig();
  return {
    name: `${site.name} — QR Kod Platformu`,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0c0118",
    theme_color: "#7c3aed",
    lang: "tr",
    orientation: "portrait-primary",
    categories: ["business", "productivity"],
  };
}
