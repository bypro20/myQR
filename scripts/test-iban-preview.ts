import { buildQrContent } from "../lib/qr/generators";
import { renderQrPng } from "../lib/qr/render";
import { validateQrInput } from "../lib/qr/validate-input";
import { normalizeQrData } from "../lib/qr/normalize";
import { DEFAULT_DESIGN } from "../lib/qr/types";
import { buildTurkishIbanQr } from "../lib/qr/iban-qr";

async function main() {
  const payload = {
    iban: "TR29 0006 7010 0000 0097 1994 93",
    receiverName: "uğur öncan",
    amount: "500",
    description: "xvxvxv",
  };

  console.log("emv", buildTurkishIbanQr(payload));

  for (const mode of ["DYNAMIC", "STATIC"] as const) {
    const normalized = normalizeQrData("IBAN", payload, "", "https://myqar.net");
    const check = validateQrInput({
      name: "yapikredi",
      type: "IBAN",
      mode,
      shortCode: "preview",
      targetUrl: normalized.targetUrl,
      payload: normalized.payload,
      baseUrl: "https://myqar.net",
    });
    console.log(mode, "valid", check.valid, check.errors);
    const content = buildQrContent({
      type: "IBAN",
      mode,
      shortCode: "preview",
      targetUrl: normalized.targetUrl,
      payload: normalized.payload,
      baseUrl: "https://myqar.net",
    });
    console.log(mode, "content len", content.length, content.slice(0, 80));
    try {
      const png = await renderQrPng(content, JSON.stringify({ ...DEFAULT_DESIGN }));
      console.log(mode, "png", png.length);
    } catch (e) {
      console.error(mode, "render error", e);
    }
  }
}

main();
