# Teşvik360 Production Deployment Guide

Bu dokümantasyon, Teşvik360 uygulamasının Portainer kullanarak production ortamında nasıl deploy edileceğini açıklamaktadır.

## 📋 İçindekiler

1. [Gereksinimler](#gereksinimler)
2. [Dosya Yapısı](#dosya-yapısı)
3. [Environment Konfigürasyonu](#environment-konfigürasyonu)
4. [Portainer ile Deployment](#portainer-ile-deployment)
5. [SSL Sertifikası Kurulumu](#ssl-sertifikası-kurulumu)
6. [Monitoring ve Logging](#monitoring-ve-logging)
7. [Backup Stratejisi](#backup-stratejisi)
8. [Troubleshooting](#troubleshooting)

## 🔧 Gereksinimler

### Sistem Gereksinimleri
- **Docker**: 20.10+ 
- **Docker Compose**: 2.0+
- **Portainer**: 2.19+
- **RAM**: Minimum 4GB (Önerilen: 8GB+)
- **Disk**: Minimum 20GB boş alan
- **CPU**: 2 Core (Önerilen: 4 Core+)

### Port Gereksinimleri
- **80**: HTTP (Nginx)
- **443**: HTTPS (Nginx) - SSL kullanılıyorsa
- **9000**: Portainer (isteğe bağlı)

## 📁 Dosya Yapısı

```
tesvik360yeni/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── init.sql
├── web/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── nginx.conf
│   └── .env.production
├── nginx/
│   ├── nginx.conf
│   └── ssl/ (SSL sertifikaları için)
├── docker-compose.prod.yml
├── .env.production
└── DEPLOYMENT.md
```

## ⚙️ Environment Konfigürasyonu

### 1. Ana Environment Dosyası (.env)

`.env.production` dosyasını `.env` olarak kopyalayın ve değerleri güncelleyin:

```bash
cp .env.production .env
```

**Kritik Değişkenler:**
```env
# Güvenlik - MUTLAKA DEĞİŞTİRİN!
DB_PASSWORD=güçlü_veritabanı_şifresi
REDIS_PASSWORD=güçlü_redis_şifresi
JWT_SECRET=çok_güçlü_jwt_anahtarı_64_karakter_minimum
JWT_REFRESH_SECRET=çok_güçlü_refresh_anahtarı_64_karakter_minimum

# Domain/URL Ayarları
CORS_ORIGIN=https://yourdomain.com
APP_URL=https://yourdomain.com

# Email Ayarları
EMAIL_HOST=smtp.yourdomain.com
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=email_app_password
```

### 2. Frontend Environment Dosyası

`web/.env.production` dosyasını güncelleyin:

```env
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_BASE_URL=https://yourdomain.com
```

## 🚀 Portainer ile Deployment

### Adım 1: Portainer'a Giriş

1. Portainer web arayüzüne giriş yapın
2. **Stacks** menüsüne gidin
3. **Add stack** butonuna tıklayın

### Adım 2: Stack Oluşturma

1. **Name**: `tesvik360-production`
2. **Build method**: `Repository` seçin
3. **Repository URL**: Projenizin Git repository URL'ini girin
4. **Compose path**: `docker-compose.prod.yml`
5. **Environment variables** bölümünde `.env` dosyasındaki değişkenleri ekleyin

### Adım 3: Environment Variables

Portainer'da aşağıdaki environment variables'ları ekleyin:

```
DB_NAME=tesvik360
DB_USER=tesvik360_user
DB_PASSWORD=güçlü_veritabanı_şifresi
REDIS_PASSWORD=güçlü_redis_şifresi
JWT_SECRET=çok_güçlü_jwt_anahtarı
JWT_REFRESH_SECRET=çok_güçlü_refresh_anahtarı
CORS_ORIGIN=https://yourdomain.com
EMAIL_HOST=smtp.yourdomain.com
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=email_app_password
```

### Adım 4: Deploy

1. **Deploy the stack** butonuna tıklayın
2. Container'ların başlatılmasını bekleyin
3. **Containers** menüsünden durumları kontrol edin

## 🔒 SSL Sertifikası Kurulumu

### Let's Encrypt ile Otomatik SSL

1. `nginx/ssl` klasörü oluşturun:
```bash
mkdir -p nginx/ssl
```

2. Certbot ile sertifika alın:
```bash
docker run --rm -v $(pwd)/nginx/ssl:/etc/letsencrypt certbot/certbot \
  certonly --standalone -d yourdomain.com
```

3. `nginx/nginx.conf` dosyasındaki HTTPS server bloğunu aktif edin

### Manuel SSL Kurulumu

1. SSL sertifikalarınızı `nginx/ssl/` klasörüne kopyalayın:
   - `cert.pem`: SSL sertifikası
   - `key.pem`: Private key

2. Nginx konfigürasyonunu güncelleyin

## 📊 Monitoring ve Logging

### Container Logları

Portainer üzerinden logları görüntüleyin:
1. **Containers** → Container seçin → **Logs**

### Komut satırından log görüntüleme:
```bash
docker-compose -f docker-compose.prod.yml logs -f [service_name]
```

### Health Check

Tüm servisler health check endpoint'leri içerir:
- **Frontend**: `http://yourdomain.com/health`
- **Backend**: `http://yourdomain.com/api/health`
- **Nginx**: `http://yourdomain.com/health`

## 💾 Backup Stratejisi

### Veritabanı Backup

Günlük otomatik backup için cron job oluşturun:

```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec tesvik360-postgres pg_dump -U tesvik360_user tesvik360 > backup_$DATE.sql
```

### Volume Backup

```bash
# Uploads backup
docker run --rm -v tesvik360_backend_uploads:/data -v $(pwd)/backups:/backup alpine tar czf /backup/uploads_backup_$(date +%Y%m%d).tar.gz -C /data .
```

## 🔧 Maintenance Komutları

### Container'ları Yeniden Başlatma
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Belirli Bir Servisi Yeniden Başlatma
```bash
docker-compose -f docker-compose.prod.yml restart backend
```

### Logları Temizleme
```bash
docker system prune -f
```

### Database Migration (Gerekirse)
```bash
docker exec -it tesvik360-backend npm run migrate
```

## 🚨 Troubleshooting

### Yaygın Sorunlar

#### 1. Container Başlamıyor
```bash
# Logları kontrol edin
docker-compose -f docker-compose.prod.yml logs [service_name]

# Container durumunu kontrol edin
docker ps -a
```

#### 2. Veritabanı Bağlantı Hatası
- Environment variables'ları kontrol edin
- PostgreSQL container'ının çalıştığını doğrulayın
- Network bağlantısını kontrol edin

#### 3. Frontend API'ye Erişemiyor
- `REACT_APP_API_URL` değişkenini kontrol edin
- Nginx konfigürasyonunu kontrol edin
- CORS ayarlarını kontrol edin

#### 4. SSL Sertifika Hatası
- Sertifika dosyalarının doğru yolda olduğunu kontrol edin
- Sertifika geçerlilik tarihini kontrol edin
- Nginx konfigürasyonunu kontrol edin

### Performans Optimizasyonu

#### 1. Resource Limits Ekleme

`docker-compose.prod.yml` dosyasına resource limits ekleyin:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

#### 2. Redis Cache Optimizasyonu

Redis konfigürasyonunu optimize edin:
```bash
# Redis container'ına bağlanın
docker exec -it tesvik360-redis redis-cli

# Memory kullanımını kontrol edin
INFO memory
```

## 📞 Destek

Sorun yaşadığınızda:

1. **Logları kontrol edin**: Container loglarını inceleyin
2. **Health check'leri kontrol edin**: `/health` endpoint'lerini test edin
3. **Resource kullanımını kontrol edin**: CPU, RAM, Disk kullanımını monitör edin
4. **Network bağlantısını test edin**: Container'lar arası iletişimi kontrol edin

## 🔄 Güncelleme Süreci

### Uygulama Güncellemesi

1. **Backup alın**:
```bash
./backup.sh
```

2. **Yeni kodu çekin**:
```bash
git pull origin main
```

3. **Container'ları yeniden build edin**:
```bash
docker-compose -f docker-compose.prod.yml build --no-cache
```

4. **Servisleri yeniden başlatın**:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Zero-Downtime Deployment

Blue-Green deployment için:

1. Yeni stack oluşturun (`tesvik360-production-new`)
2. Yeni stack'i test edin
3. Load balancer'ı yeni stack'e yönlendirin
4. Eski stack'i kaldırın

---

**Not**: Bu dokümantasyon production ortamı için hazırlanmıştır. Development ortamı için `docker-compose.yml` dosyasını kullanın.