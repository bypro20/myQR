import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "myQR — Profesyonel QR Kod Platformu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 64,
          background: "linear-gradient(135deg, #0c0118 0%, #312e81 45%, #4c1d95 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "linear-gradient(135deg, #a855f7, #ec4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 800,
            }}
          >
            QR
          </div>
          <span style={{ fontSize: 56, fontWeight: 800 }}>myQR</span>
        </div>
        <p style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.25, maxWidth: 900 }}>
          Profesyonel QR Kod Platformu
        </p>
        <p style={{ fontSize: 24, color: "#cbd5e1", marginTop: 20, maxWidth: 800, lineHeight: 1.4 }}>
          Dinamik QR · Toplu üretim · Analitik · Matbaa & ajans için
        </p>
      </div>
    ),
    { ...size },
  );
}
