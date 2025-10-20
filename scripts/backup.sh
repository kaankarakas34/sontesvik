#!/bin/bash

# Teşvik360 Production Backup Script
# Bu script veritabanı ve dosya yedeklerini alır

set -e

# Konfigürasyon
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_PREFIX="tesvik360"

# Backup dizinini oluştur
mkdir -p $BACKUP_DIR

echo "🚀 Teşvik360 Backup işlemi başlatılıyor..."
echo "📅 Tarih: $(date)"

# PostgreSQL Backup
echo "📊 Veritabanı yedeği alınıyor..."
docker exec ${CONTAINER_PREFIX}-postgres pg_dump -U tesvik360_user tesvik360 > $BACKUP_DIR/database_backup_$DATE.sql

if [ $? -eq 0 ]; then
    echo "✅ Veritabanı yedeği başarıyla alındı: database_backup_$DATE.sql"
else
    echo "❌ Veritabanı yedeği alınamadı!"
    exit 1
fi

# Uploads Backup
echo "📁 Dosya yedekleri alınıyor..."
docker run --rm \
    -v ${CONTAINER_PREFIX}_backend_uploads:/data \
    -v $(pwd)/$BACKUP_DIR:/backup \
    alpine tar czf /backup/uploads_backup_$DATE.tar.gz -C /data .

if [ $? -eq 0 ]; then
    echo "✅ Dosya yedekleri başarıyla alındı: uploads_backup_$DATE.tar.gz"
else
    echo "❌ Dosya yedekleri alınamadı!"
    exit 1
fi

# Redis Backup (isteğe bağlı)
echo "🔄 Redis yedeği alınıyor..."
docker exec ${CONTAINER_PREFIX}-redis redis-cli BGSAVE
sleep 5
docker cp ${CONTAINER_PREFIX}-redis:/data/dump.rdb $BACKUP_DIR/redis_backup_$DATE.rdb

if [ $? -eq 0 ]; then
    echo "✅ Redis yedeği başarıyla alındı: redis_backup_$DATE.rdb"
else
    echo "⚠️  Redis yedeği alınamadı (isteğe bağlı)"
fi

# Backup boyutlarını göster
echo ""
echo "📋 Backup Özeti:"
echo "=================="
ls -lh $BACKUP_DIR/*$DATE*

# Eski backup'ları temizle (30 günden eski)
echo ""
echo "🧹 Eski backup'lar temizleniyor (30+ gün)..."
find $BACKUP_DIR -name "*backup_*" -type f -mtime +30 -delete

echo ""
echo "✅ Backup işlemi tamamlandı!"
echo "📁 Backup dizini: $BACKUP_DIR"