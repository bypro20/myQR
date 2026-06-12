import LcvForm from "@/components/public/lcv-form";

type Props = { params: Promise<{ slug: string }> };

export default async function LcvPage({ params }: Props) {
  const { slug } = await params;
  return <LcvForm slug={slug} />;
}
