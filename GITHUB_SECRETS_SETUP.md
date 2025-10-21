# GitHub Secrets Kurulum Rehberi

Bu dosya, GitHub Actions deployment için gerekli secrets'ların nasıl ayarlanacağını açıklar.

## Gerekli GitHub Secrets

GitHub repository'nizde Settings > Secrets and variables > Actions bölümünde aşağıdaki secrets'ları ekleyin:

### 1. SSH_PRIVATE_KEY
**Değer:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
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
cmF0QGFzdXM=
-----END OPENSSH PRIVATE KEY-----
```

### 2. SERVER_HOST
**Değer:** `72.61.17.133`

### 3. SERVER_USER
**Değer:** `root`

### 4. SERVER_PORT
**Değer:** `22`

## Secrets'ları Ekleme Adımları

1. GitHub repository'nize gidin
2. **Settings** sekmesine tıklayın
3. Sol menüden **Secrets and variables** > **Actions** seçin
4. **New repository secret** butonuna tıklayın
5. Her bir secret için:
   - **Name** alanına secret adını girin (örn: `SSH_PRIVATE_KEY`)
   - **Secret** alanına yukarıdaki değeri yapıştırın
   - **Add secret** butonuna tıklayın

## Güvenlik Notları

- SSH private key'i asla public repository'lerde paylaşmayın
- Secrets'lar sadece GitHub Actions workflow'larında kullanılabilir
- Bu anahtarlar sadece deployment için kullanılmalıdır
- Düzenli olarak SSH anahtarlarını yenileyin

## Test

Secrets'ları ekledikten sonra, GitHub Actions workflow'u otomatik olarak çalışacaktır. 
Deployment'ın başarılı olup olmadığını Actions sekmesinden kontrol edebilirsiniz.