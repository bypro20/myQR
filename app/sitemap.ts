import type { MetadataRoute } from "next";
import { INDEXABLE_PAGES } from "@/lib/seo/pages";
import { absoluteUrl } from "@/lib/seo/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return INDEXABLE_PAGES.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
