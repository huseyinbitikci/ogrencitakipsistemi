# Öğrenci Takip Sistemi

JavaScript ile Node.js üzerinden Express kütüphanesini kullanarak ve Handlebars (HBS) yapısı ile öğrenci takip sistemi geliştirdim.



## 📋 Özellikler

Admin paneli gibi çalışan bir sistem:
- Öğrenci profilleri
- Sistem kütüphanesi ve kitap profilleri
- Öğrenciye ödev verme
- Ödev kontrol edip raporlama kısmına gönderilmesi
- Öğrenci hakkında yorum yapma

## 🚀 Modernizasyon Güncellemeleri

### ✅ Faz 1: Güvenlik (Tamamlandı)

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

### ✅ Faz 2: Kod Mimarisi (Tamamlandı)

#### Mongoose Schemas
- ✅ **Student Schema**: Öğrenci modeli validation ve index'lerle
- ✅ **Book Schema**: Kitap modeli validation ve index'lerle
- ✅ **StudentBook Schema**: Öğrenci-Kitap ilişki tablosu
- ✅ **Content Schemas**: Class, Course, Topic, Subtitle, AltKonu modelleri
- ✅ **Assignment Schemas**: DailyAssignment ve Report modelleri

#### Repository Pattern
- ✅ **BaseRepository**: Tüm CRUD işlemleri için temel sınıf
- ✅ **StudentRepository**: Öğrenci işlemleri için özel metodlar
- ✅ **BookRepository**: Kitap işlemleri için özel metodlar

#### Service Layer
- ✅ **StudentService**: Öğrenci iş mantığı
- ✅ **BookService**: Kitap iş mantığı

#### Modüler Route Yapısı
- ✅ **Students Routes**: `/routers/students/students.routes.js`
- ✅ **Books Routes**: `/routers/library/books.routes.js`
- ✅ **Modern async/await**: Callback hell yerine modern promise tabanlı kod
- ✅ **Proper error handling**: Try-catch blokları ve anlamlı hata mesajları

#### Proje Yapısı
```
routers/
├── students/
│   └── students.routes.js       # Modern öğrenci route'ları
├── library/
│   └── books.routes.js          # Modern kitap route'ları
└── app.js                       # Legacy routes (kademeli kaldırılacak)

services/
├── StudentService.js            # Öğrenci iş mantığı
└── BookService.js               # Kitap iş mantığı

repositories/
├── BaseRepository.js            # Temel CRUD
├── StudentRepository.js         # Öğrenci repository
└── BookRepository.js            # Kitap repository

models/
├── Student.js                   # Öğrenci schema
├── Book.js                      # Kitap schema
├── StudentBook.js               # İlişki tablosu
├── Content.js                   # İçerik schemas
├── Assignment.js                # Ödev schemas
└── users.js                     # Kullanıcı (mevcut)
```

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

**Faz 2 - Devam Edecek:**
- [ ] Content Management route'larını modüler hale getir
- [ ] Assignment & Reports route'larını modüler hale getir
- [ ] Legacy app.js'i tamamen kaldır

**Faz 3 - Async/Await & Code Quality:**
- [ ] Tüm legacy callback'leri async/await'e çevir
- [ ] ESLint + Prettier konfigürasyonu
- [ ] JSDoc dokümantasyonu
- [ ] Logging sistemi (winston)

**Faz 4 - Testing:**
- [ ] Unit testler (Jest)
- [ ] Integration testler
- [ ] API testleri

## 🏗️ Mimari Değişiklikler

### Eski Yapı (Legacy)
```
- 1029 satırlık app.js (God file)
- Callback hell
- Direct database queries in routes
- No separation of concerns
- Hardcoded values
```

### Yeni Yapı (Modern)
```
- Modüler route dosyaları (< 200 satır)
- Async/await pattern
- Repository → Service → Controller katmanları
- Mongoose schemas with validation
- Environment-based configuration
- Proper error handling
```

### Avantajlar
- ✅ **Maintainability**: Kod artık daha kolay okunabilir ve bakım yapılabilir
- ✅ **Testability**: Service ve repository layer'lar unit test edilebilir
- ✅ **Scalability**: Yeni özellikler eklemek daha kolay
- ✅ **Type Safety**: Mongoose schemas ile veri validasyonu
- ✅ **Separation of Concerns**: Her katman kendi sorumluluğunu biliyor

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
