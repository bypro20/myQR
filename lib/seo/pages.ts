/** Google sitemap'e dahil edilen kamuya açık, indekslenebilir sayfalar */
export const INDEXABLE_PAGES: {
  path: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.95 },
  { path: "/signup", changeFrequency: "monthly", priority: 0.9 },
  { path: "/dinamik-qr-kod", changeFrequency: "monthly", priority: 0.9 },
  { path: "/toplu-qr-kod", changeFrequency: "monthly", priority: 0.9 },
  { path: "/qr-kod-matbaa", changeFrequency: "monthly", priority: 0.85 },
  { path: "/restoran-menu-qr", changeFrequency: "monthly", priority: 0.85 },
  { path: "/panel-kiralama", changeFrequency: "monthly", priority: 0.85 },
  { path: "/hakkimizda", changeFrequency: "monthly", priority: 0.7 },
  { path: "/iletisim", changeFrequency: "monthly", priority: 0.7 },
  { path: "/gizlilik-politikasi", changeFrequency: "yearly", priority: 0.4 },
  { path: "/kullanim-kosullari", changeFrequency: "yearly", priority: 0.4 },
  { path: "/mesafeli-satis-sozlesmesi", changeFrequency: "yearly", priority: 0.4 },
  { path: "/teslimat-iade", changeFrequency: "yearly", priority: 0.4 },
];
