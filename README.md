# Öğrenci Takip Sistemi

JavaScript ile Node.js üzerinden Express kütüphanesini kullanarak ve Handlebars (HBS) yapısı ile öğrenci takip sistemi geliştirdim.



## 📋 Özellikler

Admin paneli gibi çalışan bir sistem:
- Öğrenci profilleri
- Sistem kütüphanesi ve kitap profilleri
- Öğrenciye ödev verme
- Ödev kontrol edip raporlama kısmına gönderilmesi
- Öğrenci hakkında yorum yapma

## 🚀 Modernizasyon Güncellemeleri (Faz 1: Güvenlik)

### ✅ Tamamlanan İyileştirmeler

#### Güvenlik
- ✅ **Environment Variables**: Tüm hassas bilgiler `.env` dosyasına taşındı
- ✅ **Bcrypt Fix**: Password hashing düzgün çalışıyor
- ✅ **JWT Secret**: Artık environment variable'dan alınıyor
- ✅ **Helmet**: HTTP güvenlik header'ları eklendi
- ✅ **Rate Limiting**: DDoS koruması eklendi (15 dk / 100 istek)
- ✅ **Authentication Aktif**: Tüm route'lar artık korumalı
- ✅ **Secure Cookies**: Production'da HTTPS, CSRF koruması

#### Kod Kalitesi
- ✅ **Dependencies Updated**: Tüm paketler 2024 versiyonlarına güncellendi
- ✅ **Error Handling**: Global error handler eklendi
- ✅ **Validation Middleware**: Input validation altyapısı hazır

## 📦 Kurulum

### 1. Paketleri Yükle
```bash
npm install
```

### 2. Environment Variables
`.env.example` dosyasını `.env` olarak kopyalayın ve kendi bilgilerinizi girin:

```bash
cp .env.example .env
```

**ÖNEMLİ:** Production'da mutlaka şu değerleri değiştirin:
- `JWT_SECRET` - Güçlü bir secret key kullanın
- `SESSION_SECRET` - Güçlü bir secret key kullanın
- `MONGODB_URI` - Kendi MongoDB URI'nizi kullanın

### 3. Uygulamayı Çalıştır

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## 🔐 Güvenlik Notları

### Yapılan İyileştirmeler
1. **Hardcoded credentials kaldırıldı** - Artık environment variables kullanılıyor
2. **JWT secret artık güvenli** - Environment variable'dan alınıyor
3. **Rate limiting eklendi** - Brute force saldırılara karşı koruma
4. **Helmet eklendi** - XSS, clickjacking vb. koruması
5. **Secure cookies** - Production'da HTTPS zorunlu
6. **Authentication aktif** - Tüm route'lar korumalı

### Hala Yapılması Gerekenler (Gelecek Fazlar)
- [ ] Input validation (express-validator kullanımı yaygınlaştırılacak)
- [ ] CSRF token implementasyonu
- [ ] SQL/NoSQL injection koruması güçlendirilecek
- [ ] Logging sistemi eklenecek
- [ ] Error handling iyileştirilecek

## 🏗️ Gelecek Fazlar

### Faz 2: Kod Mimarisi (Planlanan)
- Route'ları daha küçük dosyalara bölme
- Service layer oluşturma
- Repository pattern implementasyonu
- Mongoose schema'ları tanımlama
- Callback'leri async/await'e çevirme

### Faz 3: Testing & Quality (Planlanan)
- ESLint + Prettier konfigürasyonu
- Unit testler
- Integration testler
- API dokumentasyonu

## 📝 Environment Variables

| Variable | Açıklama | Zorunlu |
|----------|----------|---------|
| MONGODB_URI | MongoDB bağlantı URI'si | ✅ |
| JWT_SECRET | JWT token için secret key | ✅ |
| JWT_EXPIRES_IN | JWT token süre (saniye) | ❌ (default: 86400) |
| PORT | Sunucu port numarası | ❌ (default: 3000) |
| NODE_ENV | Environment (development/production) | ❌ |
| SESSION_SECRET | Session için secret key | ✅ |

## 🛡️ Güvenlik Kontrol Listesi

- [x] Database credentials environment variable'da
- [x] JWT secret hardcoded değil
- [x] Bcrypt düzgün import edilmiş
- [x] Authentication middleware aktif
- [x] Rate limiting var
- [x] Helmet güvenlik header'ları var
- [x] Secure cookies (production)
- [ ] Input validation her endpoint'te (devam ediyor)
- [ ] CSRF protection
- [ ] SQL/NoSQL injection tam koruması

## 👨‍💻 Geliştirici

Hüseyin Bitikci

## 📄 Lisans

ISC
