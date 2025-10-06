### Backend Kodu Özeti

Bu dosya `backend` klasöründeki dosyaların kısa özetini içerir. Her madde, dosyanın ana sorumluluğunu ve önemli notları özetler.

## Çekirdek Uygulama
- **`src/server.js`**: Express uygulamasını başlatır; güvenlik (helmet), CORS, rate limit, sıkıştırma, morgan loglama, global hata yakalama, sağlık kontrolü (`/health`), statik frontend servis etme ve tüm API route'larını mount eder. DB bağlantısını test eder, prod ortamında model senkronizasyonu ve kalıcı kullanıcılar seed işlemini koordine eder. Doküman arşivleme job’unu başlatır ve zarif kapatma (SIGTERM) yönetir.
- **`src/app.js`**: Boş içerik (şu an kullanılmıyor veya placeholder).

## Konfigürasyon ve Yardımcılar
- **`src/config/database.js`**: Sequelize konfigürasyonu (dev/test/prod), bağlantı havuzu, loglama ve `sequelize` örneği. `testConnection()` ile bağlantı testi sağlar.
- **`src/config/secrets.js`**: Boş içerik (çevresel sırlar için placeholder gibi görünüyor).
- **`src/utils/logger.js`**: Winston ve `winston-daily-rotate-file` ile dönen log dosyaları (error, combined, http), exception ve rejection handler’ları; development’ta konsola renkli log. Morgan için `logger.stream` sağlar.

## Middleware
- **`src/middleware/auth.js`**: Kimlik doğrulama/rol kontrol middleware’i (içerik incelenmedi — standart auth beklenir).
- **`src/middleware/errorHandler.js`**: Merkezi hata yakalama middleware’i (app sonunda kullanılır).
- **`src/middleware/inputValidation.js`** ve **`src/middleware/validation.js`**: Girdi doğrulama/schemalara bağlı kontroller (route’larda kullanılmak üzere).
- **`src/middleware/notFound.js`**: 404 üretimi ve yanıtı için middleware; `server.js` içinde mount edilir.

## Modeller
- **`src/models/index.js`**: Sequelize model yükleme/ilişkilendirme giriş noktası (detaylar dosyada).
- **`src/models/User.js`**: Kullanıcı modeli; roller, durumlar ve ilişkiler (ör. başvurular) beklenir.
- **`src/models/Sector.js`**, **`SectorIncentive.js`**: Sektör ve teşvik ilişkisel modelleri.
- **`src/models/IncentiveCategory.js`**, **`IncentiveType.js`**, **`Incentive.js`**: Teşvik kategorileri, tipleri ve teşviklerin ana modeli.
- **`src/models/DocumentType.js`**, **`Document.js`**, **`IncentiveDocument.js`**, **`DocumentIncentiveMapping.js`**: Doküman tipleri, kullanıcı/başvuru dokümanları ve teşvik-doküman eşlemesi.
- **`src/models/Application.js`**, **`ApplicationMessage.js`**, **`ApplicationRoom.js`**: Başvuru süreci, odalar (kullanıcı-danışman iletişim kanalı) ve mesajlaşma.
- **`src/models/Notification.js`**: Bildirim modeli.
- **`src/models/ticket.js`**, **`TicketMessage.js`**: Destek talebi ve mesajlaşma modelleri.
- **`src/models/ConsultantAssignmentLog.js`**, **`ConsultantReview.js`**: Danışman atama kayıtları ve değerlendirmeler.

Not: Model tanımları dosya isimlerinden çıkarılmıştır; `server.js` içindeki import ve senkronizasyon sırası kullanılır.

## Servisler
- **`src/services/notificationService.js`**: Bildirim oluşturma, gönderme ve durum yönetimi (dosya büyük; e-posta/push/uygulama içi gibi çoklu kanal desteği içeriyor olabilir).
- **`src/services/documentArchiveService.js`**: Doküman arşivleme mantığı; arşiv kriterleri ve alan güncellemeleri.
- **`src/services/consultantAssignmentService.js`**: Danışman atama/yeniden atama kuralları.
- **`src/services/applicationRoomService.js`**: Başvuru sohbet odaları ve yetkilendirme kontrolleri.

## İşler (Jobs)
- **`src/jobs/documentArchiveJob.js`**: Zamanlanmış iş; dokümanların `archivedAt/archivedReason` ve `status` alanlarına göre otomatik arşivleme ve temizlik.

## Controller’lar
- **`src/controllers/authController.js`**: Giriş/kayıt/şifre ve token akışları.
- **`src/controllers/dashboardController.js`**: Yönetim/özet metrik ve panel verileri.
- **`src/controllers/sectorController.js`**: Sektör CRUD ve listeleme.
- **`src/controllers/incentiveTypeController.js`**, **`incentiveController.js`**, **`incentiveDocumentController.js`**, **`incentiveGuideController.js`**: Teşvik tipleri, teşvikler, teşvik-dokümanları ve rehber içerikleri.
- **`src/controllers/documentTypeController.js`**, **`documentController.js`**, **`documentIncentiveMappingController.js`**: Doküman türleri ve doküman/teşvik eşlemesi işlemleri.
- **`src/controllers/applicationController.js`**, **`applicationMessageController.js`**, **`applicationRoomController.js`**: Başvurular, mesajlar ve oda yönetimi.
- **`src/controllers/notificationController.js`**: Bildirim endpoint’leri (okundu/okunmadı, listeleme).
- **`src/controllers/ticketController.js`**: Destek talepleri ve mesajlaşma akışı.
- **`src/controllers/consultantController.js`**, **`userController.js`**: Danışman ve kullanıcı işlemleri.

## Rotalar
- Route dosyaları `server.js` içinde `/api/...` altına mount edilir:
  - **`routes/auth.js`**: Kimlik doğrulama uçları.
  - **`routes/dashboard.js`**: Panel verileri.
  - **`routes/sectors.js`**, **`routes/incentiveTypes.js`**, **`routes/incentives.js`**: Sektör ve teşvik uçları.
  - **`routes/documentTypes.js`**, **`routes/incentiveDocuments.js`**, **`routes/documents.js`**, **`routes/documentIncentiveMappingRoutes.js`**: Dokümanlarla ilgili uçlar.
  - **`routes/incentiveGuides.js`**: Rehber içerik uçları.
  - **`routes/applications.js`**, **`routes/applicationMessages.js`**, **`routes/applicationRooms.js`**: Başvuru ve mesajlaşma uçları.
  - **`routes/notifications.js`**: Bildirim uçları.
  - **`routes/ticketRoutes.js`**: Destek talep uçları.
  - **`routes/admin.js`**, **`routes/logs.js`**, **`routes/users.js`**, **`routes/consultantRoutes.js`**: Yönetim, log görüntüleme, kullanıcı ve danışman uçları.

## Migrasyonlar (Sequelize)
- **`20241201000000-*` ... `20251005193214-*`**: Şema evrimini yönetir. Öne çıkanlar:
  - `20241201000003-add-validity-date-to-document-types.js`: `DocumentTypes` tablosuna `validityDate` ve `descriptionEn` ekler; indeks oluşturur.
  - `20241201000004-add-archive-fields-to-documents.js`: `Documents` tablosuna `archivedAt`, `archivedReason`, `status` (ENUM: active/inactive/archived) ve indeksler ekler; enum değerini güvenli şekilde genişletir.
  - `20241201000012-add-rejection-columns.js`: `users` tablosuna red ile ilgili sütunlar (`rejected_by`, `rejected_at`, `rejection_reason`) ve ilgili indeksler ekler.
  - `20250929170813-create-ticket.js`: `Tickets` tablosunu oluşturur (title, description, type, status, priority, userId, consultantId, sectorId, zaman damgaları).

## Loglar ve Yardımcı Dosyalar
- **`backend/logs/*.log`**: Günlük dönen log dosyaları (error, combined, http, exceptions, rejections tarih bazlı).
- **`backend/test-server.js`**: Hızlı test/deneme amaçlı backend başlatıcısı (içerik adından çıkarım).
- **`backend/package.json`**: Backend’e özel script ve bağımlılıklar.
- **`backend/uploads/applications/`**: Başvurulara ait yüklenen dosyalar için depolama.

Not: Bazı dosyalar içerik olarak incelenemedi; özetler isim ve bağlamdan çıkarsanmıştır. Gerekirse bu dosyalar tek tek açılıp daha detaylı özetle güncellenebilir.


