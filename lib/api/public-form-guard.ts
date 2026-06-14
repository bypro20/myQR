const rateMap = new Map<string, { count: number; reset: number }>();

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function publicFormRateLimit(key: string, limit = 8, windowMs = 60_000) {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || now > entry.reset) {
    rateMap.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

function cleanText(value: unknown, max = 200) {
  return String(value ?? "").trim().slice(0, max);
}

function cleanPhone(value: unknown) {
  return String(value ?? "").replace(/[^\d+()\s-]/g, "").trim().slice(0, 24);
}

function cleanEmail(value: unknown) {
  const email = String(value ?? "").trim().slice(0, 120);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

export function parseWarrantySubmission(body: Record<string, unknown>) {
  const slug = cleanText(body.slug, 80);
  const customerName = cleanText(body.customerName, 120);
  const phone = cleanPhone(body.phone);
  const productName = cleanText(body.productName, 120);
  const serialNumber = cleanText(body.serialNumber, 80);

  if (!slug) return { ok: false as const, error: "Form bulunamadı." };
  if (!customerName || customerName.length < 2) return { ok: false as const, error: "Ad soyad gerekli." };
  if (!phone || phone.replace(/\D/g, "").length < 8) return { ok: false as const, error: "Geçerli telefon gerekli." };
  if (!productName) return { ok: false as const, error: "Ürün adı gerekli." };
  if (!serialNumber) return { ok: false as const, error: "Seri numarası gerekli." };

  const email = cleanEmail(body.email);
  return {
    ok: true as const,
    data: {
      slug,
      customerName,
      phone,
      email: email || null,
      productName,
      productModel: cleanText(body.productModel, 80) || null,
      serialNumber,
      purchaseDate: cleanText(body.purchaseDate, 40) || null,
      invoiceNumber: cleanText(body.invoiceNumber, 80) || null,
      purchasedFrom: cleanText(body.purchasedFrom, 120) || null,
      warrantyStart: cleanText(body.warrantyStart, 40) || null,
      warrantyEnd: cleanText(body.warrantyEnd, 40) || null,
      notes: cleanText(body.notes, 500) || null,
    },
  };
}

const LCV_ATTENDANCE = new Set(["Katılacağım", "Katılamayacağım", "Kararsızım"]);

export function parseLcvSubmission(body: Record<string, unknown>) {
  const slug = cleanText(body.slug, 80);
  const fullName = cleanText(body.fullName, 120);
  const phone = cleanPhone(body.phone);
  const attendance = cleanText(body.attendance, 40);
  const guestCount = Math.min(20, Math.max(1, Number(body.guestCount || 1)));

  if (!slug) return { ok: false as const, error: "Form bulunamadı." };
  if (!fullName || fullName.length < 2) return { ok: false as const, error: "Ad soyad gerekli." };
  if (!phone || phone.replace(/\D/g, "").length < 8) return { ok: false as const, error: "Geçerli telefon gerekli." };
  if (!LCV_ATTENDANCE.has(attendance)) return { ok: false as const, error: "Katılım durumu seçin." };

  return {
    ok: true as const,
    data: {
      slug,
      fullName,
      phone,
      attendance,
      guestCount: Number.isFinite(guestCount) ? guestCount : 1,
      notes: cleanText(body.notes, 500) || null,
    },
  };
}
