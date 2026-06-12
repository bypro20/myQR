# myQR

QRBaskı için bağımsız QR kod üretim ve yönetim sistemi. Gu-chat ve ProMedia ile bağlantısı yoktur.

## Özellikler

- 14+ QR tipi (URL, Maps, Yorum, Wi-Fi, WhatsApp, Sosyal, Bio, vCard, E-posta, Telefon, SMS, PDF, Garanti, LCV)
- Statik ve dinamik QR
- Tasarım özelleştirme ve baskı çıktısı (PNG, SVG, PDF)
- 25 hazır şablon
- Garanti aktivasyon modülü
- LCV / katılım formu
- Toplu QR üretimi (CSV → ZIP)
- Tarama istatistikleri

## Kurulum

```bash
cd /home/bypro20/myQR
npm install
npm run db:push
npm run db:seed
npm run dev
```

Giriş: `admin@myqr.com` / `admin123`

## GitHub

```bash
git init
git add .
git commit -m "myQR: QRBaskı QR yönetim sistemi"
# GitHub'da yeni repo oluştur: myQR
git remote add origin git@github.com:KULLANICI/myQR.git
git push -u origin main
```

## Vercel

1. [vercel.com](https://vercel.com) → New Project → `myQR` repo
2. Env değişkenleri:
   - `DATABASE_URL` (Vercel Postgres / Neon)
   - `AUTH_SECRET`
   - `NEXT_PUBLIC_APP_URL=https://your-domain.com`
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`
3. Deploy

## Klasör yapısı

```
myQR/
├── app/dashboard/     # Yönetim paneli
├── app/q/[code]       # Dinamik yönlendirme
├── app/bio/           # Link Bio sayfaları
├── app/garanti/       # Garanti formu
├── app/lcv/           # Katılım formu
├── uploads/qr/        # QR çıktıları
└── prisma/            # Veritabanı şeması
```
