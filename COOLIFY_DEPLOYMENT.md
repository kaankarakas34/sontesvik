# Coolify Git Deployment Rehberi

Bu rehber, Tesvik360 projesinin Coolify ile Git üzerinden nasıl deploy edileceğini ve otomatik URL yapılandırmasını açıklar.

## Coolify Otomatik Domain ve SSL Kurulumu

Coolify, Git deployment ile birlikte aşağıdaki özellikleri otomatik olarak sağlar:

- **Otomatik Domain**: `COOLIFY_FQDN` environment variable ile otomatik domain yönetimi
- **Otomatik SSL**: Let's Encrypt ile ücretsiz SSL sertifikaları
- **Git Integration**: Repository değişikliklerinde otomatik deployment
- **Environment Management**: Güvenli environment variable yönetimi
- **HTTPS Redirect**: HTTP trafiğini otomatik HTTPS'e yönlendirme
- **Sertifika Yenileme**: Otomatik sertifika yenileme

## Git Deployment için Yapılan Değişiklikler

### 1. Frontend Dinamik Yapılandırma

#### Vite Config (`vite.config.ts`)
- **Dinamik API URL**: `COOLIFY_FQDN` environment variable'ından otomatik API URL oluşturma
- **Global Variables**: `__API_URL__` ve `__COOLIFY_FQDN__` build-time değişkenleri
- **Environment Detection**: Development, production ve Coolify ortamları için otomatik yapılandırma

#### API Config (`src/config/api.config.ts`)
- **Dynamic Base URL**: Coolify FQDN'den otomatik base URL oluşturma
- **Fallback URLs**: Ortam değişkenlerine göre fallback URL'ler
- **Deployment Info**: Coolify deployment bilgilerini içeren yapılandırma

#### TypeScript Definitions (`vite-env.d.ts`)
- **Global Types**: Coolify global değişkenleri için TypeScript tanımları
- **Environment Types**: Genişletilmiş environment variable tipleri

### 2. Backend Dinamik Yapılandırma

#### Coolify Config (`src/config/coolify.js`)
- **Dynamic URLs**: `COOLIFY_FQDN`'den otomatik URL oluşturma
- **CORS Configuration**: Dinamik CORS ayarları
- **SSL Configuration**: Otomatik SSL/TLS yapılandırması
- **Rate Limiting**: Environment-based rate limiting
- **Session Management**: Güvenli session yapılandırması

#### Server Configuration (`src/server.js`)
- **Coolify Integration**: Coolify yapılandırmasının server'a entegrasyonu
- **Dynamic CORS**: Otomatik CORS origin yönetimi
- **Deployment Logging**: Coolify deployment bilgilerinin loglanması

### 3. Docker Compose Optimizasyonu

#### Coolify Docker Compose (`docker-compose.coolify.yml`)
- **Coolify Labels**: Service discovery için Coolify etiketleri
- **Environment Variables**: Coolify otomatik değişkenleri
- **Health Checks**: Gelişmiş sağlık kontrolleri
- **Volume Management**: Coolify-managed volume'lar
- **Network Configuration**: Optimized network ayarları

### 4. Environment Yapılandırması

#### Coolify Environment (`.env.coolify`)
- **Dynamic URLs**: `COOLIFY_FQDN` tabanlı URL yapılandırması
- **Security Settings**: Production güvenlik ayarları
- **Database Configuration**: Güvenli veritabanı yapılandırması
- **Email Settings**: E-posta sunucu ayarları

## Coolify Git Deployment Adımları

### 1. Git Repository Hazırlığı

```bash
# Tüm değişiklikleri commit edin
git add .
git commit -m "Coolify Git deployment için dinamik yapılandırma"
git push origin main
```

### 2. Coolify'da Git Application Oluşturma

1. Coolify dashboard'una giriş yapın
2. **"New Resource"** > **"Application"** seçin
3. **"Git Repository"** seçeneğini seçin
4. Repository URL'nizi girin (GitHub, GitLab, Bitbucket)
5. Branch olarak **`main`** seçin
6. **"Docker Compose"** deployment type'ını seçin
7. Docker Compose dosyası olarak **`docker-compose.coolify.yml`** belirtin

### 3. Coolify Environment Variables

Coolify otomatik olarak aşağıdaki değişkenleri sağlar:

#### Otomatik Coolify Variables
```env
# Coolify tarafından otomatik sağlanan
COOLIFY_FQDN=your-app.coolify.domain
COOLIFY_URL=https://your-app.coolify.domain
COOLIFY_BRANCH=main
COOLIFY_COMMIT_SHA=commit_hash
COOLIFY_DEPLOYMENT_ID=deployment_id
COOLIFY_PROJECT_ID=project_id
COOLIFY_SERVICE_ID=service_id
```

#### Manuel Ayarlanması Gereken Variables
```env
# Database
DB_NAME=tesvik360
DB_USER=tesvik360_user
DB_PASSWORD=güçlü_şifre_buraya

# Redis
REDIS_PASSWORD=redis_şifresi_buraya

# JWT Secrets
JWT_SECRET=çok_güçlü_jwt_secret_buraya
JWT_REFRESH_SECRET=çok_güçlü_refresh_secret_buraya

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=email@domain.com
EMAIL_PASS=email_şifresi

# Application Settings
NODE_ENV=production
LOG_LEVEL=info
BCRYPT_SALT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
RATE_LIMIT_DISABLED=false

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/app/uploads
```

### 4. Git Deployment Yapılandırması

#### Build Settings
- **Build Command**: Otomatik (Docker Compose)
- **Start Command**: Otomatik (Docker Compose)
- **Port**: 80 (Nginx proxy)
- **Health Check**: `/api/health` endpoint

#### Git Integration
- **Auto Deploy**: Branch push'larında otomatik deployment
- **Build Logs**: Real-time build ve deployment logları
- **Rollback**: Önceki deployment'lara geri dönüş
- **Environment Branches**: Farklı branch'lar için farklı environment'lar

### 5. Otomatik Domain ve SSL Kurulumu

#### Domain Yapılandırması
1. Coolify dashboard'da **"Domains"** sekmesine gidin
2. Custom domain ekleyin (örn: `tesvik360.com`)
3. DNS ayarlarınızda A kaydını Coolify IP'sine yönlendirin
4. Coolify otomatik olarak domain'i yapılandıracak

#### SSL Sertifikası (Let's Encrypt)
1. **"Generate SSL Certificate"** seçeneğini aktifleştirin
2. Coolify otomatik olarak:
   - Let's Encrypt sertifikası oluşturacak
   - HTTP'yi HTTPS'e yönlendirecek
   - Sertifikayı otomatik yenileyecek (90 günde bir)
   - Security headers ekleyecek

#### Nginx Proxy (Otomatik)
Coolify kendi Nginx proxy'sini kullanır:
- **Load Balancing**: Otomatik yük dengeleme
- **Health Checks**: Servis sağlık kontrolleri
- **SSL Termination**: SSL sonlandırma
- **Gzip Compression**: Otomatik sıkıştırma
- **Security Headers**: Güvenlik başlıkları

### 6. Git Deployment Monitoring

#### Real-time Monitoring
Coolify otomatik olarak sağlar:
- **Build Logs**: Real-time build süreç logları
- **Application Logs**: Container logları ve uygulama çıktıları
- **Resource Usage**: CPU, RAM, disk kullanımı
- **Health Checks**: Otomatik servis sağlık kontrolleri
- **Deployment History**: Tüm deployment geçmişi

#### Webhook Integration
- **Git Webhooks**: Push'larda otomatik deployment
- **Slack/Discord**: Deployment bildirimleri
- **Email Alerts**: Hata durumlarında e-posta bildirimleri

### 7. Environment Management

#### Branch-based Environments
```bash
# Production (main branch)
main → production.tesvik360.com

# Staging (develop branch)  
develop → staging.tesvik360.com

# Feature branches
feature/new-ui → feature-new-ui.tesvik360.com
```

#### Environment Variables per Branch
Her branch için farklı environment variables:
- **Production**: Canlı veritabanı ve ayarlar
- **Staging**: Test veritabanı ve ayarlar
- **Feature**: Development ayarları

### 8. DNS Yapılandırması

Domain sağlayıcınızda aşağıdaki DNS kayıtlarını ekleyin:

```dns
# Ana domain
A    @              COOLIFY_SERVER_IP
A    www            COOLIFY_SERVER_IP

# Subdomain'ler (isteğe bağlı)
A    app            COOLIFY_SERVER_IP
A    api            COOLIFY_SERVER_IP
A    staging        COOLIFY_SERVER_IP

# CNAME (alternatif)
CNAME tesvik360    your-coolify-domain.com
```

### 9. Rollback ve Versioning

#### Otomatik Rollback
```bash
# Coolify dashboard'dan
1. "Deployments" sekmesine gidin
2. Önceki başarılı deployment'ı seçin
3. "Rollback" butonuna tıklayın
```

#### Git-based Rollback
```bash
# Git üzerinden rollback
git revert HEAD
git push origin main
# Coolify otomatik olarak yeni deployment başlatacak
```

## Sorun Giderme

### Git Deployment Sorunları

#### Build Fails
```bash
# Coolify build logs'unu kontrol edin
1. Dashboard > Application > Logs
2. Build hatalarını inceleyin
3. Dependencies ve Docker image'ları kontrol edin
```

#### Environment Variables Missing
```bash
# Coolify dashboard'da kontrol edin
1. Application > Environment Variables
2. Gerekli değişkenlerin ayarlandığından emin olun
3. COOLIFY_FQDN otomatik ayarlanmış mı kontrol edin
```

### Dynamic URL Sorunları

#### Frontend API Calls Failing
```javascript
// Browser console'da kontrol edin
console.log('API URL:', window.__API_URL__);
console.log('Coolify FQDN:', window.__COOLIFY_FQDN__);

// Network tab'da API isteklerini kontrol edin
```

#### CORS Errors
```bash
# Backend logs'unda CORS ayarlarını kontrol edin
# Coolify dashboard > Application > Logs > Backend
```

### Database Connection Issues

#### PostgreSQL Connection
```bash
# Container logs'unu kontrol edin
docker logs tesvik360-postgres

# Database environment variables'ları kontrol edin
DB_HOST=postgres  # Container name
DB_PORT=5432
```

#### Redis Connection
```bash
# Redis logs'unu kontrol edin
docker logs tesvik360-redis

# Redis environment variables'ları kontrol edin
REDIS_HOST=redis  # Container name
REDIS_PORT=6379
```

## Güvenlik Best Practices

### Environment Variables Security
```env
# Güçlü secrets kullanın
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Database şifreleri
DB_PASSWORD=$(openssl rand -base64 16)
REDIS_PASSWORD=$(openssl rand -base64 16)
```

### SSL/TLS Configuration
```bash
# Coolify otomatik olarak sağlar:
- Let's Encrypt SSL certificates
- HTTP to HTTPS redirect
- Security headers (HSTS, CSP, etc.)
- TLS 1.2+ enforcement
```

### CORS Security
```javascript
// Production'da spesifik origin'ler kullanın
CORS_ORIGIN=https://tesvik360.com,https://www.tesvik360.com
```

## Performance Optimization

### Docker Image Optimization
```dockerfile
# Multi-stage builds kullanılıyor
# Production images minimal boyutta
# Layer caching optimize edilmiş
```

### Resource Limits
```yaml
# docker-compose.coolify.yml'de
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
```

### Monitoring ve Alerting
```bash
# Coolify otomatik monitoring sağlar:
- CPU/Memory usage
- Disk space
- Response times
- Error rates
```
- Resource monitoring
- Health checks
- Backup management

sağlar. Dashboard'dan bu bilgilere erişebilirsiniz.

## Backup Stratejisi

1. **Database**: Otomatik PostgreSQL backup'ları aktifleştirin
2. **Files**: Upload edilen dosyalar için volume backup'ları ayarlayın
3. **Configuration**: Environment variables'ları güvenli bir yerde saklayın

## Güncelleme Süreci

1. Kod değişikliklerini git'e push edin
2. Coolify otomatik olarak yeni deployment başlatacak
3. Health check'ler başarılı olursa traffic yeni versiyona yönlendirilecek

## Destek

Sorun yaşarsanız:
1. Coolify logs'larını kontrol edin
2. Application logs'larını inceleyin
3. Health check durumlarını kontrol edin