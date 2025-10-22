# 🚀 Hızlı Başlangıç Rehberi - Teşvik360

Bu rehber, projeyi local ortamda **en hızlı şekilde** çalıştırmanız için hazırlanmıştır.

## ⚡ Hızlı Kurulum (5 Dakika)

### 1️⃣ Gereksinimler
- **Node.js** (v18+) - [İndir](https://nodejs.org/)
- **Docker Desktop** - [İndir](https://www.docker.com/products/docker-desktop/)

### 2️⃣ Projeyi Klonlayın
```bash
git clone https://github.com/kaankarakas34/sontesvik.git
cd sontesvik
```

### 3️⃣ Tek Komutla Kurulum
```bash
# Tüm bağımlılıkları yükle ve veritabanını başlat
npm run setup:local
```

### 4️⃣ Development Serverları Başlat
```bash
# Backend ve Frontend'i aynı anda başlat
npm run dev
```

### 5️⃣ Tarayıcıda Aç
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5002/api

---

## 🔧 Manuel Kurulum (Docker Desktop Yoksa)

### PostgreSQL'i Manuel Kurun

#### Windows
1. [PostgreSQL'i indirin](https://www.postgresql.org/download/windows/)
2. Kurulum sırasında şifre: `postgres`
3. pgAdmin ile `tesvik360_local` veritabanını oluşturun

#### macOS
```bash
brew install postgresql
brew services start postgresql
createdb tesvik360_local
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb tesvik360_local
```

### Veritabanı Şemasını Yükleyin
```bash
# PostgreSQL'e bağlanın ve şemayı yükleyin
psql -U postgres -d tesvik360_local -f database_schema.sql
```

### Environment Dosyalarını Ayarlayın
```bash
# Backend için
cp backend/.env.local backend/.env

# Frontend için  
cp web/.env.local web/.env
```

### Servisleri Başlatın
```bash
# Backend (Terminal 1)
cd backend
npm install
npm run dev

# Frontend (Terminal 2)
cd web
npm install
npm run dev
```

---

## 🎯 Test Kullanıcıları

Sistem otomatik olarak test kullanıcıları oluşturur:

### 👨‍💼 Admin
- **Email**: `admin@tesvik360.com`
- **Şifre**: `admin123`

### 👤 Test Kullanıcı
- **Email**: `test@example.com`
- **Şifre**: `test123`

---

## 📋 Kullanışlı Komutlar

```bash
# Tüm servisleri başlat
npm run dev

# Sadece backend
npm run dev:backend

# Sadece frontend
npm run dev:frontend

# Veritabanını başlat (Docker)
npm run db:setup

# Veritabanını sıfırla
npm run db:reset

# Bağlantıları test et
npm run health:check

# Tüm testleri çalıştır
npm test

# Kod kalitesi kontrolü
npm run lint
```

---

## 🐛 Sorun Giderme

### ❌ Docker Desktop Çalışmıyor
```bash
# Docker Desktop'ı başlatın ve şu komutu deneyin:
docker --version

# Eğer çalışmıyorsa manuel PostgreSQL kurulumu yapın (yukarıda)
```

### ❌ Port Zaten Kullanımda
```bash
# Hangi process'in portu kullandığını bulun
netstat -ano | findstr :5002  # Backend port
netstat -ano | findstr :5173  # Frontend port

# Process'i sonlandırın (Windows)
taskkill /PID <PID_NUMBER> /F
```

### ❌ Veritabanı Bağlantı Hatası
```bash
# Bağlantıyı test edin
node test-db-connection.js

# PostgreSQL'in çalıştığını kontrol edin
# Windows: Services.msc'de PostgreSQL servisini kontrol edin
# macOS/Linux: sudo systemctl status postgresql
```

### ❌ npm install Hatası
```bash
# Node modules'ları temizleyin
npm run clean:all

# Yeniden yükleyin
npm run install:all
```

---

## 🔍 Sistem Durumu Kontrolü

### Servislerin Çalışıp Çalışmadığını Kontrol Edin
```bash
# Backend API sağlık kontrolü
curl http://localhost:5002/api/health

# Frontend erişim kontrolü
curl http://localhost:5173

# Veritabanı bağlantı testi
node test-db-connection.js
```

### Log Dosyalarını İnceleyin
```bash
# Backend logları
tail -f backend/logs/app-local.log

# Docker logları (eğer kullanıyorsanız)
npm run docker:logs
```

---

## 📚 Daha Fazla Bilgi

- **Detaylı Kurulum**: [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)
- **Production Deployment**: [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md)
- **API Dokümantasyonu**: http://localhost:5002/api/docs (geliştirme aşamasında)

---

## 🆘 Yardım Lazım?

1. **Sorun Giderme**: Bu dosyadaki "Sorun Giderme" bölümünü kontrol edin
2. **GitHub Issues**: Yeni bir issue oluşturun
3. **Logları Paylaşın**: Hata mesajlarını ve log dosyalarını ekleyin

---

**🎉 Başarılı kurulum sonrası http://localhost:5173 adresinden uygulamaya erişebilirsiniz!**