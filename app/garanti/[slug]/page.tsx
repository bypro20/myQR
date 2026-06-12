import GarantiForm from "@/components/public/garanti-form";

type Props = { params: Promise<{ slug: string }> };

export default async function GarantiPage({ params }: Props) {
  const { slug } = await params;
  return <GarantiForm slug={slug} />;
}
