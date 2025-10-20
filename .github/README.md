# GitHub Actions Workflows

Bu dizin, Teşvik360 projesi için GitHub Actions CI/CD pipeline'larını içerir.

## 🚀 Hızlı Başlangıç

### 1. Secrets Kurulumu
```bash
# Repository Settings > Secrets and variables > Actions
# Gerekli secrets'ları ekleyin (detaylar için SECRETS.md'ye bakın)
```

### 2. İlk Deployment
```bash
# Main branch'e push yapın
git push origin main
# → Production deployment otomatik başlar
```

### 3. Kurulum Doğrulama
```bash
# Actions > Verify Secrets Setup > Run workflow
# Tüm konfigürasyonları kontrol eder
```

## 📁 Workflow Dosyaları

| Dosya | Açıklama | Tetikleyici |
|-------|----------|-------------|
| `ci-cd.yml` | Ana CI/CD pipeline | Push to main/develop, PR |
| `pr-check.yml` | Pull request kontrolü | Pull request |
| `release.yml` | Release oluşturma | Tag push (v*) |
| `docker-build.yml` | Docker image build | Reusable workflow |
| `deploy-production.yml` | Production deployment | Manuel |
| `staging-deploy.yml` | Staging deployment | Push to develop |
| `setup-secrets.yml` | Secrets doğrulama | Manuel |

## 🔧 Konfigürasyon

### Gerekli Secrets
- `DEPLOY_SSH_KEY` - Production SSH key
- `DEPLOY_HOST` - Production server
- `DEPLOY_USER` - SSH username
- `DEPLOY_PATH` - Application path
- `DEPLOY_URL` - Production URL

### Environment Variables
- `NODE_ENV` - Environment (production/staging)
- `DATABASE_URL` - Database connection
- `JWT_SECRET` - JWT secret key

## 📖 Detaylı Dokümantasyon

- [**GitHub Actions Guide**](../GITHUB_ACTIONS.md) - Kapsamlı kullanım kılavuzu
- [**Secrets Setup**](SECRETS.md) - Secrets konfigürasyon rehberi
- [**Production Deployment**](../DEPLOYMENT.md) - Production deployment rehberi

## 🎯 Workflow Durumları

### ✅ Başarılı Deployment
- Tüm testler geçti
- Docker images build edildi
- Production'a deploy edildi
- Health check başarılı

### ❌ Başarısız Deployment
- Test hatası
- Build hatası
- Deployment hatası
- Health check başarısız

### 🔄 Rollback
- Otomatik rollback (health check fail)
- Manuel rollback (Actions > Deploy Production)

## 🚨 Acil Durum

### Production Down
1. **Actions > Deploy Production**
2. **Enable rollback** seçeneğini işaretle
3. **Run workflow** ile rollback başlat

### Hotfix Deployment
1. Hotfix branch oluştur
2. Fix'i uygula ve test et
3. Main'e merge et
4. Otomatik deployment başlar

## 📊 Monitoring

### Workflow Status
- GitHub > Actions sekmesi
- Real-time status updates
- Detailed logs

### Application Health
- Production: `https://tesvik360.com/api/health`
- Staging: `https://staging.tesvik360.com/api/health`

## 🔗 Yararlı Linkler

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [SSH Key Setup](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

---

**Not:** İlk kez kullanıyorsanız, [SECRETS.md](SECRETS.md) dosyasını okuyarak gerekli konfigürasyonları yapın.