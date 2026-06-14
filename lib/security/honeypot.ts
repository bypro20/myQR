/** Bot honeypot — doldurulmuşsa istek reddedilir */
export function isHoneypotTripped(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  const s = String(value).trim();
  return s.length > 0;
}
