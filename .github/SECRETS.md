# GitHub Actions Secrets ve Environment Variables Konfigürasyonu

Bu dokümantasyon, Teşvik360 projesinin GitHub Actions CI/CD pipeline'ları için gerekli secrets ve environment variables'ların nasıl konfigüre edileceğini açıklar.

## 📋 Gerekli Secrets

### Repository Secrets (Settings > Secrets and variables > Actions)

#### 🔐 Production Deployment Secrets

```bash
# Production Server SSH Bilgileri
DEPLOY_SSH_KEY          # Production sunucusuna SSH erişimi için private key
DEPLOY_HOST             # Production sunucu IP adresi veya domain (örn: 192.168.1.100)
DEPLOY_USER             # SSH kullanıcı adı (örn: ubuntu, root)
DEPLOY_PATH             # Uygulama dizini (örn: /opt/tesvik360)
DEPLOY_URL              # Production URL (örn: https://tesvik360.com)

# Staging Server SSH Bilgileri (Opsiyonel)
STAGING_SSH_KEY         # Staging sunucusuna SSH erişimi için private key
STAGING_HOST            # Staging sunucu IP adresi
STAGING_USER            # Staging SSH kullanıcı adı
STAGING_PATH            # Staging uygulama dizini
STAGING_URL             # Staging URL (örn: https://staging.tesvik360.com)

# Container Registry (GitHub Container Registry kullanılıyor)
GITHUB_TOKEN            # Otomatik olarak sağlanır, manuel ekleme gerekmez
```

#### 🗄️ Database ve External Services (Opsiyonel)

```bash
# Production Database (Eğer harici DB kullanılıyorsa)
PROD_DB_HOST            # Production database host
PROD_DB_USER            # Production database kullanıcısı
PROD_DB_PASSWORD        # Production database şifresi
PROD_DB_NAME            # Production database adı

# Email Service (Eğer CI/CD'de bildirim gönderilecekse)
SMTP_HOST               # Email SMTP host
SMTP_USER               # Email kullanıcısı
SMTP_PASSWORD           # Email şifresi

# Monitoring ve Alerting
SLACK_WEBHOOK_URL       # Slack bildirim webhook'u (opsiyonel)
DISCORD_WEBHOOK_URL     # Discord bildirim webhook'u (opsiyonel)
```

## 🌍 Environment Konfigürasyonu

### Production Environment

GitHub repository'nizde **Settings > Environments** bölümünden `production` environment'ını oluşturun:

#### Protection Rules:
- ✅ Required reviewers: 1-2 kişi
- ✅ Wait timer: 5 dakika (opsiyonel)
- ✅ Restrict to specific branches: `main`

#### Environment Secrets:
```bash
DEPLOY_SSH_KEY          # Production SSH key
DEPLOY_HOST             # Production server
DEPLOY_USER             # Production user
DEPLOY_PATH             # Production path
DEPLOY_URL              # Production URL
```

### Staging Environment (Opsiyonel)

`staging` environment'ını oluşturun:

#### Protection Rules:
- ✅ Restrict to specific branches: `develop`, `staging`

#### Environment Secrets:
```bash
STAGING_SSH_KEY         # Staging SSH key
STAGING_HOST            # Staging server
STAGING_USER            # Staging user
STAGING_PATH            # Staging path
STAGING_URL             # Staging URL
```

## 🔧 SSH Key Kurulumu

### 1. SSH Key Çifti Oluşturma

```bash
# Yeni SSH key çifti oluştur
ssh-keygen -t ed25519 -C "github-actions@tesvik360" -f ~/.ssh/tesvik360_deploy

# Public key'i sunucuya kopyala
ssh-copy-id -i ~/.ssh/tesvik360_deploy.pub user@your-server.com

# Veya manuel olarak:
cat ~/.ssh/tesvik360_deploy.pub >> ~/.ssh/authorized_keys
```

### 2. Private Key'i GitHub'a Ekleme

```bash
# Private key içeriğini kopyala
cat ~/.ssh/tesvik360_deploy

# GitHub > Settings > Secrets and variables > Actions > New repository secret
# Name: DEPLOY_SSH_KEY
# Value: (private key içeriğini yapıştır)
```

### 3. Sunucu Konfigürasyonu

```bash
# Sunucuda gerekli dizinleri oluştur
sudo mkdir -p /opt/tesvik360
sudo chown $USER:$USER /opt/tesvik360

# Git repository'yi clone et
cd /opt/tesvik360
git clone https://github.com/kaankarakas34/sontesvik.git .

# Docker ve Docker Compose kurulumunu kontrol et
docker --version
docker-compose --version
```

## 📝 Secrets Konfigürasyon Örnekleri

### Minimal Production Setup

```bash
# Zorunlu secrets
DEPLOY_SSH_KEY="-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAFwAAAAdzc2gtcn...
-----END OPENSSH PRIVATE KEY-----"

DEPLOY_HOST="192.168.1.100"
DEPLOY_USER="ubuntu"
DEPLOY_PATH="/opt/tesvik360"
DEPLOY_URL="https://tesvik360.com"
```

### Tam Konfigürasyon

```bash
# Production
DEPLOY_SSH_KEY="..."
DEPLOY_HOST="prod.tesvik360.com"
DEPLOY_USER="deploy"
DEPLOY_PATH="/opt/tesvik360"
DEPLOY_URL="https://tesvik360.com"

# Staging
STAGING_SSH_KEY="..."
STAGING_HOST="staging.tesvik360.com"
STAGING_USER="deploy"
STAGING_PATH="/opt/tesvik360-staging"
STAGING_URL="https://staging.tesvik360.com"

# Notifications
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
```

## 🚀 Deployment Workflow'larını Aktifleştirme

### 1. Repository'yi Hazırlama

```bash
# Workflow dosyalarını commit et
git add .github/workflows/
git commit -m "feat: add GitHub Actions CI/CD workflows"
git push origin main
```

### 2. İlk Deployment

```bash
# Manuel deployment tetikleme
# GitHub > Actions > Deploy to Production > Run workflow
# Version: main
# Skip backup: false (ilk deployment için)
```

### 3. Otomatik Deployment

- **Main branch'e push**: Otomatik production deployment
- **Develop branch'e push**: Otomatik staging deployment
- **Tag push (v1.0.0)**: Release workflow tetiklenir

## 🔍 Troubleshooting

### SSH Bağlantı Sorunları

```bash
# SSH bağlantısını test et
ssh -i ~/.ssh/tesvik360_deploy user@server

# SSH agent'ı kontrol et
ssh-add -l

# Known hosts sorunları
ssh-keyscan -H your-server.com >> ~/.ssh/known_hosts
```

### Docker Registry Sorunları

```bash
# GitHub Container Registry'ye login test
echo $GITHUB_TOKEN | docker login ghcr.io -u username --password-stdin

# Image pull test
docker pull ghcr.io/kaankarakas34/sontesvik/backend:latest
```

### Deployment Sorunları

```bash
# Sunucuda log kontrolü
cd /opt/tesvik360
./scripts/deploy.sh status
docker-compose -f docker-compose.prod.yml logs

# Health check
curl -f https://tesvik360.com/api/health
```

## 📚 Ek Kaynaklar

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [SSH Key Management](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- [Environment Protection Rules](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)

## 🔒 Güvenlik Notları

1. **SSH Keys**: Private key'leri asla kod repository'sine commit etmeyin
2. **Secrets Rotation**: SSH key'leri ve diğer secrets'ları düzenli olarak yenileyin
3. **Access Control**: Production environment'ına sadece yetkili kişilerin erişimini sağlayın
4. **Audit Logs**: Deployment loglarını düzenli olarak kontrol edin
5. **Backup**: Her deployment öncesi otomatik backup alınır