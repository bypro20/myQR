import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignupPageClient } from "@/components/auth/signup-form";
import { buildMetadata } from "@/lib/seo/metadata";
import { isLaunchActive, totalSignupCredits, signupOfferLine } from "@/lib/marketing/launch-config";

export const metadata: Metadata = buildMetadata({
  title: "Ücretsiz Kayıt",
  description: `${signupOfferLine()} — QR kod platformuna anında erişim. Matbaa, ajans ve perakende için.`,
  path: "/signup",
  keywords: ["myqr kayıt", "qr kod ücretsiz", "qr kod deneme"],
});

export default async function SignupPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");
  return (
    <SignupPageClient signupCredits={totalSignupCredits()} launchActive={isLaunchActive()} />
  );
}
