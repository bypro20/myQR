const COMMON = new Set([
  "password",
  "12345678",
  "123456789",
  "qwerty123",
  "password1",
  "11111111",
]);

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Şifre en az 8 karakter olmalı.";
  if (password.length > 128) return "Şifre çok uzun.";
  if (!/[a-zA-Z]/.test(password)) return "Şifre en az bir harf içermeli.";
  if (!/[0-9]/.test(password)) return "Şifre en az bir rakam içermeli.";
  if (COMMON.has(password.toLowerCase())) return "Bu şifre çok zayıf. Daha güçlü bir şifre seçin.";
  return null;
}
