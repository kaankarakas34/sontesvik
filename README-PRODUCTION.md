# Teşvik360 - Production Deployment

Bu proje, teşvik başvurularını yönetmek için geliştirilmiş modern bir web uygulamasıdır.

## 🚀 Hızlı Başlangıç

### 1. Gereksinimler
- Docker 20.10+
- Docker Compose 2.0+
- Portainer (isteğe bağlı)

### 2. Kurulum

```bash
# Repository'yi klonlayın
git clone <repository-url>
cd tesvik360yeni

# Environment dosyasını hazırlayın
cp .env.production .env
# .env dosyasını düzenleyin (özellikle şifreler ve domain)

# Frontend environment dosyasını hazırlayın
cp web/.env.production web/.env.production.local
# API URL'lerini güncelleyin

# Deployment script'ini çalıştırın
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 3. Portainer ile Kurulum

1. Portainer'a giriş yapın
2. **Stacks** → **Add stack**
3. **Name**: `tesvik360-production`
4. **Repository**: Bu repository'nin URL'i
5. **Compose path**: `docker-compose.prod.yml`
6. Environment variables'ları ekleyin
7. **Deploy the stack**

## 📋 Servisler

| Servis | Port | Açıklama |
|--------|------|----------|
| Nginx | 80, 443 | Reverse Proxy & Load Balancer |
| Frontend | - | React.js Web Uygulaması |
| Backend | - | Node.js API Server |
| PostgreSQL | - | Veritabanı |
| Redis | - | Cache & Session Store |

## 🔧 Yönetim Komutları

```bash
# Deployment
./scripts/deploy.sh deploy

# Backup alma
./scripts/deploy.sh backup

# Logları görüntüleme
./scripts/deploy.sh logs

# Servis durumu
./scripts/deploy.sh status

# Rollback
./scripts/deploy.sh rollback 20240115_143022

# Servisleri yeniden başlatma
./scripts/deploy.sh restart

# Temizlik
./scripts/deploy.sh cleanup
```

## 🔒 Güvenlik

### Kritik Environment Variables

```env
# Mutlaka değiştirin!
DB_PASSWORD=güçlü_veritabanı_şifresi
REDIS_PASSWORD=güçlü_redis_şifresi
JWT_SECRET=çok_güçlü_jwt_anahtarı_64_karakter_minimum
JWT_REFRESH_SECRET=çok_güçlü_refresh_anahtarı_64_karakter_minimum

# Domain ayarları
CORS_ORIGIN=https://yourdomain.com
APP_URL=https://yourdomain.com
REACT_APP_API_URL=https://yourdomain.com/api
```

### SSL Kurulumu

```bash
# Let's Encrypt ile
mkdir -p nginx/ssl
docker run --rm -v $(pwd)/nginx/ssl:/etc/letsencrypt certbot/certbot \
  certonly --standalone -d yourdomain.com

# nginx/nginx.conf dosyasındaki HTTPS bloğunu aktif edin
```

## 📊 Monitoring

### Health Check Endpoint'leri
- **Frontend**: `http://yourdomain.com/health`
- **Backend**: `http://yourdomain.com/api/health`
- **Nginx**: `http://yourdomain.com/health`

### Log Monitoring
```bash
# Tüm loglar
docker-compose -f docker-compose.prod.yml logs -f

# Belirli servis
docker-compose -f docker-compose.prod.yml logs -f backend
```

## 💾 Backup & Restore

### Otomatik Backup
```bash
# Manuel backup
./scripts/backup.sh

# Cron job için (günlük 02:00)
0 2 * * * /path/to/tesvik360/scripts/backup.sh
```

### Restore
```bash
# Backup listesi
ls backups/

# Restore
./scripts/restore.sh 20240115_143022
```

## 🚨 Troubleshooting

### Yaygın Sorunlar

#### Container başlamıyor
```bash
# Logları kontrol edin
docker-compose -f docker-compose.prod.yml logs [service]

# Container durumu
docker ps -a
```

#### Veritabanı bağlantı hatası
- Environment variables kontrol edin
- PostgreSQL container durumunu kontrol edin
- Network bağlantısını test edin

#### Frontend API'ye erişemiyor
- `REACT_APP_API_URL` kontrol edin
- Nginx konfigürasyonu kontrol edin
- CORS ayarları kontrol edin

### Performance Monitoring

```bash
# Resource kullanımı
docker stats

# Disk kullanımı
docker system df

# Network trafiği
docker-compose -f docker-compose.prod.yml top
```

## 📞 Destek

Detaylı dokümantasyon için: [DEPLOYMENT.md](./DEPLOYMENT.md)

### Hızlı Komutlar

```bash
# Sistem durumu
./scripts/deploy.sh status

# Acil restart
docker-compose -f docker-compose.prod.yml restart

# Acil stop
docker-compose -f docker-compose.prod.yml down

# Disk temizliği
docker system prune -f
```

---

**⚠️ Önemli**: Production ortamında çalıştırmadan önce tüm environment variables'ları güvenli değerlerle güncelleyin!