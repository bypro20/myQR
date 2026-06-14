import type { JsonLd } from "@/lib/seo/json-ld";

type Props = {
  data: JsonLd | JsonLd[];
};

export function JsonLdScript({ data }: Props) {
  const graphs = Array.isArray(data) ? data : [data];
  return (
    <>
      {graphs.map((graph, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
      ))}
    </>
  );
}
