/** Kısa, kolay yazılabir FAST açıklama kodu */
export function fastReferenceCode(orderId: string) {
  const clean = orderId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `MYQR${clean.slice(-8).padStart(8, "0")}`;
}
