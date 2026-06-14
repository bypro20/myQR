import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site-config";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/admin/",
          "/api/",
          "/q/",
          "/bio/",
          "/lcv/",
          "/garanti/",
          "/login",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
