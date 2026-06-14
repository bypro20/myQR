import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { GoogleTags } from "@/components/analytics/google-tags";
import { guLiveChatHeadScripts } from "@/components/site/gu-live-chat";
import { SiteShield } from "@/components/security/site-shield";
import { JsonLdScript } from "@/components/seo/json-ld";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  ...buildMetadata({
    absoluteTitle: true,
    title: "myQR | Profesyonel QR Kod Platformu",
    description:
      "Matbaa, ajans ve perakende için dinamik QR kodları, toplu üretim, garanti formları ve canlı analitik — tek panelde.",
    path: "/",
  }),
  title: {
    default: "myQR | Profesyonel QR Kod Platformu",
    template: "%s | myQR",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${jakarta.variable} h-full`}>
      <head>{guLiveChatHeadScripts()}</head>
      <body className="min-h-full antialiased">
        <GoogleTags />
        <JsonLdScript data={[organizationJsonLd(), webSiteJsonLd()]} />
        <SiteShield>{children}</SiteShield>
      </body>
    </html>
  );
}
