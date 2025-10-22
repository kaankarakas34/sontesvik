# Coolify Deployment Rehberi

Bu rehber, Tesvik360 projesinin Coolify ile nasıl deploy edileceğini açıklar.

## Önemli Değişiklikler

Coolify deployment için aşağıdaki değişiklikler yapılmıştır:

### 1. Frontend Değişiklikleri

- **Vite Config**: `vite.config.ts` dosyasında proxy ayarları kaldırıldı
- **Environment Variables**: `.env` ve `.env.production` dosyalarında API URL'leri göreceli yollara (`/api`) çevrildi
- **Host Ayarı**: Vite server host'u `0.0.0.0` olarak ayarlandı

### 2. Backend Değişiklikleri

- **CORS Ayarları**: `server.js` dosyasında CORS origin `true` olarak ayarlandı
- **Host Ayarı**: Server listen fonksiyonu `0.0.0.0` host ile çalışacak şekilde güncellendi
- **Environment Variables**: `.env` dosyasında `CORS_ORIGIN=*` eklendi

### 3. Nginx Değişiklikleri

- **Server Name**: `server_name _` olarak ayarlandı (herhangi bir domain kabul eder)
- **SSL Support**: 443 portu için SSL desteği aktifleştirildi
- **HTTPS Redirect**: HTTP trafiği HTTPS'e yönlendirilecek şekilde yapılandırıldı

### 4. Docker Compose Değişiklikleri

- **CORS Origin**: Production compose dosyasında `CORS_ORIGIN: "*"` olarak ayarlandı

## Coolify Deployment Adımları

### 1. Proje Hazırlığı

```bash
# Projeyi git repository'sine push edin
git add .
git commit -m "Coolify deployment için yapılandırma güncellemeleri"
git push origin main
```

### 2. Coolify'da Proje Oluşturma

1. Coolify dashboard'una giriş yapın
2. "New Resource" > "Application" seçin
3. Git repository'nizi bağlayın
4. Branch olarak `main` seçin

### 3. Environment Variables Ayarlama

Coolify'da aşağıdaki environment variables'ları ayarlayın:

```env
# Database
DB_NAME=tesvik360
DB_USER=tesvik360_user
DB_PASSWORD=güçlü_şifre_buraya
DB_HOST=postgres
DB_PORT=5432

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis_şifresi_buraya

# JWT
JWT_SECRET=çok_güçlü_jwt_secret_buraya
JWT_REFRESH_SECRET=çok_güçlü_refresh_secret_buraya

# CORS
CORS_ORIGIN=*

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=email@domain.com
EMAIL_PASS=email_şifresi

# App
NODE_ENV=production
PORT=5000

# Frontend
VITE_API_BASE_URL=/api
VITE_NODE_ENV=production
VITE_APP_NAME=Tesvik360
```

### 4. Docker Compose Ayarlama

Coolify'da Docker Compose deployment seçin ve `docker-compose.prod.yml` dosyasını kullanın.

### 5. SSL Sertifikası

Coolify otomatik olarak Let's Encrypt SSL sertifikası oluşturacaktır. Manuel SSL sertifikası kullanmak isterseniz:

1. Coolify dashboard'da SSL sekmesine gidin
2. Sertifika dosyalarınızı yükleyin
3. Nginx yapılandırmasını güncelleyin

### 6. Domain Ayarlama

1. Coolify'da domain ayarlarına gidin
2. Kendi domain'inizi ekleyin
3. DNS ayarlarınızı Coolify'ın verdiği IP adresine yönlendirin

## Sorun Giderme

### API Adresleri Localhost'a Yönleniyor

Bu sorun çözülmüştür. Yapılan değişiklikler:

1. **Frontend**: API URL'leri göreceli yollara çevrildi (`/api`)
2. **Backend**: CORS ayarları tüm origin'lere izin verecek şekilde güncellendi
3. **Nginx**: Proxy ayarları herhangi bir domain ile çalışacak şekilde yapılandırıldı

### Build Hataları

Eğer build sırasında hata alırsanız:

1. Node.js versiyonunu kontrol edin (18+ önerilir)
2. Dependencies'leri temizleyip yeniden yükleyin:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Database Bağlantı Sorunları

1. Environment variables'ların doğru ayarlandığından emin olun
2. PostgreSQL servisinin çalıştığını kontrol edin
3. Network ayarlarını kontrol edin

## Güvenlik Notları

1. **JWT Secrets**: Production'da mutlaka güçlü, rastgele secret'lar kullanın
2. **Database Şifreleri**: Güçlü şifreler kullanın
3. **Email Credentials**: App password kullanın, asıl şifrenizi kullanmayın
4. **CORS**: Gerekirse CORS ayarlarını daha kısıtlayıcı hale getirin

## Monitoring ve Logs

Coolify otomatik olarak:
- Application logs
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