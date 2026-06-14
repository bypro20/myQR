import { QR_CATALOG, getSamplePayload } from "../lib/qr/catalog";
import { buildQrContent } from "../lib/qr/generators";
import { normalizeQrData } from "../lib/qr/normalize";
import { renderQrPng } from "../lib/qr/render";
import { validateQrInput } from "../lib/qr/validate-input";
import { DEFAULT_DESIGN } from "../lib/qr/types";

const baseUrl = "https://myqar.net";

async function main() {
  const failures: string[] = [];

  for (const entry of QR_CATALOG) {
    const payload = getSamplePayload(entry.id);
    const normalized = normalizeQrData(entry.id, payload, "", baseUrl);
    const mode = entry.staticOnly ? "STATIC" : "DYNAMIC";
    const check = validateQrInput({
      name: `test-${entry.id}`,
      type: entry.id,
      mode,
      shortCode: "preview",
      targetUrl: normalized.targetUrl,
      payload: normalized.payload,
      baseUrl,
    });

    if (!check.valid) {
      failures.push(`${entry.id}: validation ${check.errors.join("; ")}`);
      continue;
    }

    const content = buildQrContent({
      type: entry.id,
      mode,
      shortCode: "preview",
      targetUrl: normalized.targetUrl,
      payload: normalized.payload,
      baseUrl,
    });

    if (!content?.trim()) {
      failures.push(`${entry.id}: empty content`);
      continue;
    }

    try {
      const png = await renderQrPng(content, DEFAULT_DESIGN);
      if (!png?.length) failures.push(`${entry.id}: empty png`);
    } catch (err) {
      failures.push(`${entry.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (failures.length) {
    console.error("FAILURES:");
    failures.forEach((f) => console.error(" -", f));
    process.exit(1);
  }

  console.log(`OK: ${QR_CATALOG.length} QR types rendered`);
}

main();
