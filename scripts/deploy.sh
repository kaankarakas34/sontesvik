#!/bin/bash

# Teşvik360 Production Deployment Script
# Bu script uygulamayı production ortamına deploy eder

set -e

# Konfigürasyon
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_BEFORE_DEPLOY=true
CONTAINER_PREFIX="tesvik360"

# Renkli çıktı için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonksiyonlar
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Gerekli dosyaların varlığını kontrol et
check_requirements() {
    log_info "Gereksinimler kontrol ediliyor..."
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "Docker Compose dosyası bulunamadı: $COMPOSE_FILE"
        exit 1
    fi
    
    if [ ! -f ".env" ]; then
        log_error "Environment dosyası bulunamadı: .env"
        log_info "Lütfen .env.production dosyasını .env olarak kopyalayın ve düzenleyin"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker kurulu değil!"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose kurulu değil!"
        exit 1
    fi
    
    log_success "Tüm gereksinimler karşılanıyor"
}

# Backup al
create_backup() {
    if [ "$BACKUP_BEFORE_DEPLOY" = true ]; then
        log_info "Deployment öncesi backup alınıyor..."
        
        if [ -f "./scripts/backup.sh" ]; then
            chmod +x ./scripts/backup.sh
            ./scripts/backup.sh
            log_success "Backup başarıyla alındı"
        else
            log_warning "Backup script'i bulunamadı, backup atlanıyor"
        fi
    fi
}

# Mevcut container'ları durdur
stop_containers() {
    log_info "Mevcut container'lar durduruluyor..."
    
    if docker-compose -f $COMPOSE_FILE ps -q | grep -q .; then
        docker-compose -f $COMPOSE_FILE down
        log_success "Container'lar durduruldu"
    else
        log_info "Çalışan container bulunamadı"
    fi
}

# Image'ları build et
build_images() {
    log_info "Docker image'ları build ediliyor..."
    
    docker-compose -f $COMPOSE_FILE build --no-cache --parallel
    
    if [ $? -eq 0 ]; then
        log_success "Image'lar başarıyla build edildi"
    else
        log_error "Image build işlemi başarısız!"
        exit 1
    fi
}

# Container'ları başlat
start_containers() {
    log_info "Container'lar başlatılıyor..."
    
    docker-compose -f $COMPOSE_FILE up -d
    
    if [ $? -eq 0 ]; then
        log_success "Container'lar başarıyla başlatıldı"
    else
        log_error "Container'lar başlatılamadı!"
        exit 1
    fi
}

# Health check
health_check() {
    log_info "Sağlık kontrolü yapılıyor..."
    
    # Backend health check
    for i in {1..30}; do
        if curl -f http://localhost/api/health &>/dev/null; then
            log_success "Backend sağlıklı"
            break
        fi
        
        if [ $i -eq 30 ]; then
            log_error "Backend sağlık kontrolü başarısız!"
            return 1
        fi
        
        log_info "Backend için bekleniyor... ($i/30)"
        sleep 10
    done
    
    # Frontend health check
    for i in {1..10}; do
        if curl -f http://localhost/health &>/dev/null; then
            log_success "Frontend sağlıklı"
            break
        fi
        
        if [ $i -eq 10 ]; then
            log_error "Frontend sağlık kontrolü başarısız!"
            return 1
        fi
        
        log_info "Frontend için bekleniyor... ($i/10)"
        sleep 5
    done
    
    log_success "Tüm servisler sağlıklı"
}

# Container durumlarını göster
show_status() {
    log_info "Container durumları:"
    docker-compose -f $COMPOSE_FILE ps
    
    echo ""
    log_info "Kullanılan portlar:"
    docker-compose -f $COMPOSE_FILE ps --format "table {{.Name}}\t{{.Ports}}"
    
    echo ""
    log_info "Disk kullanımı:"
    docker system df
}

# Cleanup
cleanup() {
    log_info "Temizlik yapılıyor..."
    
    # Kullanılmayan image'ları temizle
    docker image prune -f
    
    # Kullanılmayan volume'ları temizle (dikkatli!)
    # docker volume prune -f
    
    log_success "Temizlik tamamlandı"
}

# Ana deployment fonksiyonu
deploy() {
    echo "🚀 Teşvik360 Production Deployment"
    echo "=================================="
    echo "📅 Tarih: $(date)"
    echo ""
    
    check_requirements
    create_backup
    stop_containers
    build_images
    start_containers
    
    log_info "Container'ların başlaması bekleniyor..."
    sleep 30
    
    if health_check; then
        show_status
        cleanup
        
        echo ""
        log_success "🎉 Deployment başarıyla tamamlandı!"
        echo ""
        log_info "🔗 Uygulama URL'leri:"
        echo "   • Frontend: http://localhost"
        echo "   • Backend API: http://localhost/api"
        echo "   • Health Check: http://localhost/health"
        echo ""
        log_info "📊 Monitoring:"
        echo "   • Loglar: docker-compose -f $COMPOSE_FILE logs -f"
        echo "   • Durum: docker-compose -f $COMPOSE_FILE ps"
        
    else
        log_error "Deployment başarısız! Logları kontrol edin:"
        echo "docker-compose -f $COMPOSE_FILE logs"
        exit 1
    fi
}

# Rollback fonksiyonu
rollback() {
    log_warning "Rollback işlemi başlatılıyor..."
    
    if [ $# -eq 0 ]; then
        echo "Kullanım: $0 rollback <backup_date>"
        echo "Örnek: $0 rollback 20240115_143022"
        exit 1
    fi
    
    BACKUP_DATE=$1
    
    if [ -f "./scripts/restore.sh" ]; then
        chmod +x ./scripts/restore.sh
        ./scripts/restore.sh $BACKUP_DATE
    else
        log_error "Restore script'i bulunamadı!"
        exit 1
    fi
}

# Komut satırı argümanlarını işle
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "rollback")
        rollback $2
        ;;
    "backup")
        create_backup
        ;;
    "status")
        show_status
        ;;
    "logs")
        docker-compose -f $COMPOSE_FILE logs -f ${2:-}
        ;;
    "restart")
        log_info "Servisler yeniden başlatılıyor..."
        docker-compose -f $COMPOSE_FILE restart ${2:-}
        log_success "Yeniden başlatma tamamlandı"
        ;;
    "stop")
        stop_containers
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "Kullanım: $0 {deploy|rollback|backup|status|logs|restart|stop|cleanup}"
        echo ""
        echo "Komutlar:"
        echo "  deploy          - Uygulamayı deploy et"
        echo "  rollback <date> - Belirtilen backup'a geri dön"
        echo "  backup          - Manuel backup al"
        echo "  status          - Container durumlarını göster"
        echo "  logs [service]  - Logları göster"
        echo "  restart [service] - Servisleri yeniden başlat"
        echo "  stop            - Tüm servisleri durdur"
        echo "  cleanup         - Temizlik yap"
        exit 1
        ;;
esac