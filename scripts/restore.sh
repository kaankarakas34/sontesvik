#!/bin/bash

# Teşvik360 Production Restore Script
# Bu script backup'lardan veri geri yüklemesi yapar

set -e

# Konfigürasyon
BACKUP_DIR="./backups"
CONTAINER_PREFIX="tesvik360"

# Kullanım kontrolü
if [ $# -ne 1 ]; then
    echo "Kullanım: $0 <backup_date>"
    echo "Örnek: $0 20240115_143022"
    echo ""
    echo "Mevcut backup'lar:"
    ls -1 $BACKUP_DIR/database_backup_*.sql 2>/dev/null | sed 's/.*database_backup_\(.*\)\.sql/\1/' || echo "Backup bulunamadı"
    exit 1
fi

BACKUP_DATE=$1

# Backup dosyalarının varlığını kontrol et
DB_BACKUP="$BACKUP_DIR/database_backup_$BACKUP_DATE.sql"
UPLOADS_BACKUP="$BACKUP_DIR/uploads_backup_$BACKUP_DATE.tar.gz"
REDIS_BACKUP="$BACKUP_DIR/redis_backup_$BACKUP_DATE.rdb"

if [ ! -f "$DB_BACKUP" ]; then
    echo "❌ Veritabanı backup dosyası bulunamadı: $DB_BACKUP"
    exit 1
fi

if [ ! -f "$UPLOADS_BACKUP" ]; then
    echo "❌ Dosya backup'ı bulunamadı: $UPLOADS_BACKUP"
    exit 1
fi

echo "🔄 Teşvik360 Restore işlemi başlatılıyor..."
echo "📅 Backup Tarihi: $BACKUP_DATE"
echo "📅 Restore Tarihi: $(date)"

# Onay al
read -p "⚠️  Bu işlem mevcut verileri silecek! Devam etmek istiyor musunuz? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ İşlem iptal edildi."
    exit 1
fi

# Container'ların çalıştığını kontrol et
echo "🔍 Container durumları kontrol ediliyor..."
if ! docker ps | grep -q ${CONTAINER_PREFIX}-postgres; then
    echo "❌ PostgreSQL container'ı çalışmıyor!"
    exit 1
fi

# Veritabanını geri yükle
echo "📊 Veritabanı geri yükleniyor..."

# Önce mevcut bağlantıları kes
docker exec ${CONTAINER_PREFIX}-postgres psql -U tesvik360_user -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'tesvik360' AND pid <> pg_backend_pid();"

# Veritabanını sil ve yeniden oluştur
docker exec ${CONTAINER_PREFIX}-postgres psql -U tesvik360_user -d postgres -c "DROP DATABASE IF EXISTS tesvik360;"
docker exec ${CONTAINER_PREFIX}-postgres psql -U tesvik360_user -d postgres -c "CREATE DATABASE tesvik360;"

# Backup'ı geri yükle
docker exec -i ${CONTAINER_PREFIX}-postgres psql -U tesvik360_user -d tesvik360 < $DB_BACKUP

if [ $? -eq 0 ]; then
    echo "✅ Veritabanı başarıyla geri yüklendi"
else
    echo "❌ Veritabanı geri yüklenemedi!"
    exit 1
fi

# Dosyaları geri yükle
echo "📁 Dosyalar geri yükleniyor..."

# Önce mevcut dosyaları temizle
docker run --rm \
    -v ${CONTAINER_PREFIX}_backend_uploads:/data \
    alpine sh -c "rm -rf /data/* /data/.*" 2>/dev/null || true

# Backup'ı geri yükle
docker run --rm \
    -v ${CONTAINER_PREFIX}_backend_uploads:/data \
    -v $(pwd)/$BACKUP_DIR:/backup \
    alpine tar xzf /backup/uploads_backup_$BACKUP_DATE.tar.gz -C /data

if [ $? -eq 0 ]; then
    echo "✅ Dosyalar başarıyla geri yüklendi"
else
    echo "❌ Dosyalar geri yüklenemedi!"
    exit 1
fi

# Redis geri yükle (isteğe bağlı)
if [ -f "$REDIS_BACKUP" ]; then
    echo "🔄 Redis geri yükleniyor..."
    
    # Redis'i durdur
    docker exec ${CONTAINER_PREFIX}-redis redis-cli FLUSHALL
    
    # Backup'ı kopyala
    docker cp $REDIS_BACKUP ${CONTAINER_PREFIX}-redis:/data/dump.rdb
    
    # Redis'i yeniden başlat
    docker restart ${CONTAINER_PREFIX}-redis
    
    echo "✅ Redis başarıyla geri yüklendi"
else
    echo "⚠️  Redis backup'ı bulunamadı, atlanıyor..."
fi

# Backend'i yeniden başlat (cache temizleme için)
echo "🔄 Backend yeniden başlatılıyor..."
docker restart ${CONTAINER_PREFIX}-backend

echo ""
echo "✅ Restore işlemi tamamlandı!"
echo "📅 Backup Tarihi: $BACKUP_DATE"
echo "🔗 Uygulama URL: http://localhost"
echo ""
echo "⚠️  Lütfen uygulamanın düzgün çalıştığını kontrol edin."