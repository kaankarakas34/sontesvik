# 🚀 Local Development Kurulum Rehberi

Bu rehber, Teşvik360 projesini local development ortamında çalıştırmak için gerekli adımları içerir.

## 📋 Gereksinimler

### Zorunlu
- **Node.js** (v18 veya üzeri)
- **npm** veya **yarn**
- **Git**

### Opsiyonel (Docker kullanımı için)
- **Docker Desktop**
- **Docker Compose**

### Veritabanı Seçenekleri
1. **Docker ile PostgreSQL** (Önerilen - Kolay kurulum)
2. **Local PostgreSQL kurulumu**

## 🛠️ Kurulum Seçenekleri

### Seçenek 1: Docker ile Hızlı Kurulum (Önerilen)

#### 1. Projeyi klonlayın
```bash
git clone https://github.com/kaankarakas34/sontesvik.git
cd sontesvik
```

#### 2. Sadece veritabanını Docker ile çalıştırın
```bash
# PostgreSQL ve Redis'i başlat
docker-compose -f docker-compose.local.yml up postgres redis -d

# Veritabanının hazır olmasını bekleyin (yaklaşık 30 saniye)
docker-compose -f docker-compose.local.yml logs postgres
```

#### 3. Backend'i local'de çalıştırın
```bash
cd backend

# Bağımlılıkları yükleyin
npm install

# Local environment dosyasını kopyalayın
cp .env.local .env

# Veritabanı tablolarını oluşturun (otomatik olarak yapılır)
# Gerekirse manuel olarak: npm run db:migrate

# Backend'i başlatın
npm run dev
```

#### 4. Frontend'i local'de çalıştırın
```bash
cd web

# Bağımlılıkları yükleyin
npm install

# Local environment dosyasını kopyalayın
cp .env.local .env

# Frontend'i başlatın
npm run dev
```

### Seçenek 2: Tamamen Docker ile Çalıştırma

```bash
# Tüm servisleri Docker ile çalıştır
docker-compose -f docker-compose.local.yml --profile full-stack up -d

# Logları takip et
docker-compose -f docker-compose.local.yml logs -f
```

### Seçenek 3: Local PostgreSQL ile Kurulum

#### 1. PostgreSQL'i kurun
- Windows: https://www.postgresql.org/download/windows/
- macOS: `brew install postgresql`
- Linux: `sudo apt-get install postgresql`

#### 2. Veritabanını oluşturun
```sql
-- PostgreSQL'e bağlanın ve şu komutları çalıştırın:
CREATE DATABASE tesvik360_local;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE tesvik360_local TO postgres;
```

#### 3. Veritabanı şemasını yükleyin
```bash
# database_schema.sql dosyasını PostgreSQL'e yükleyin
psql -U postgres -d tesvik360_local -f database_schema.sql
```

#### 4. Backend ve Frontend'i çalıştırın (Seçenek 1'deki 3. ve 4. adımlar)

## 🔧 Environment Dosyaları

### Backend (.env.local)
```env
NODE_ENV=development
PORT=5002
HOST=localhost
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tesvik360_local
DB_USER=postgres
DB_PASSWORD=postgres
```

### Frontend (.env.local)
```env
VITE_API_BASE_URL=http://localhost:5002/api
VITE_NODE_ENV=development
VITE_APP_NAME=Teşvik360 Local
```

## 🌐 Erişim URL'leri

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5002/api
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379 (Docker kullanıyorsanız)

## 👤 Test Kullanıcıları

Veritabanı şeması otomatik olarak test kullanıcıları oluşturur:

### Admin Kullanıcı
- **Email**: admin@tesvik360.com
- **Şifre**: admin123

### Test Kullanıcı
- **Email**: test@example.com
- **Şifre**: test123

## 🔍 Geliştirme Komutları

### Backend
```bash
cd backend

# Development modunda çalıştır (nodemon ile)
npm run dev

# Production modunda çalıştır
npm start

# Testleri çalıştır
npm test

# Veritabanını sıfırla
npm run db:reset

# Linting
npm run lint
```

### Frontend
```bash
cd web

# Development server'ı başlat
npm run dev

# Production build
npm run build

# Build'i önizle
npm run preview

# Testleri çalıştır
npm test

# Linting
npm run lint
```

## 🐛 Sorun Giderme

### Backend başlamıyor
1. PostgreSQL'in çalıştığını kontrol edin
2. `.env` dosyasındaki veritabanı bilgilerini kontrol edin
3. Port 5002'nin boş olduğunu kontrol edin

### Frontend API'ye bağlanamıyor
1. Backend'in çalıştığını kontrol edin (http://localhost:5002/api/health)
2. CORS ayarlarını kontrol edin
3. Vite proxy ayarlarını kontrol edin

### Veritabanı bağlantı hatası
1. PostgreSQL servisinin çalıştığını kontrol edin
2. Veritabanı adı, kullanıcı adı ve şifresini kontrol edin
3. Firewall ayarlarını kontrol edin

### Docker sorunları
```bash
# Container'ları durdurun
docker-compose -f docker-compose.local.yml down

# Volume'ları temizleyin
docker-compose -f docker-compose.local.yml down -v

# Yeniden başlatın
docker-compose -f docker-compose.local.yml up -d
```

## 📊 Veritabanı Yönetimi

### pgAdmin ile Bağlantı
- **Host**: localhost
- **Port**: 5432
- **Database**: tesvik360_local
- **Username**: postgres
- **Password**: postgres

### Veritabanını Sıfırlama
```bash
# Docker ile
docker-compose -f docker-compose.local.yml down -v
docker-compose -f docker-compose.local.yml up postgres -d

# Local PostgreSQL ile
dropdb tesvik360_local
createdb tesvik360_local
psql -U postgres -d tesvik360_local -f database_schema.sql
```

## 🚀 Production'a Hazırlık

Local development'tan production'a geçiş için:

1. Environment dosyalarını production değerleri ile güncelleyin
2. `docker-compose.prod.yml` dosyasını kullanın
3. SSL sertifikalarını yapılandırın
4. Güvenlik ayarlarını gözden geçirin

## 📝 Notlar

- Local development'ta hot reload aktiftir
- API istekleri otomatik olarak proxy üzerinden yönlendirilir
- Veritabanı değişiklikleri otomatik olarak kaydedilir
- Log dosyaları `backend/logs/` klasöründe saklanır

## 🆘 Yardım

Sorun yaşıyorsanız:
1. Bu rehberdeki sorun giderme bölümünü kontrol edin
2. GitHub Issues'da benzer sorunları arayın
3. Yeni bir issue oluşturun

Happy coding! 🎉