#!/bin/bash

# Tesvik360 Production Deployment Script
# This script handles the deployment of the application on the production server

set -e  # Exit on any error

echo "🚀 Starting Tesvik360 deployment..."

# Configuration
PROJECT_DIR="/opt/tesvik360"
BACKUP_DIR="/opt/tesvik360-backups"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

# Create directories if they don't exist
mkdir -p $PROJECT_DIR
mkdir -p $BACKUP_DIR

# Navigate to project directory
cd $PROJECT_DIR

# Function to create backup
create_backup() {
    echo "📦 Creating backup..."
    BACKUP_NAME="tesvik360-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
    
    # Backup database
    if docker ps | grep -q tesvik360-postgres; then
        echo "🗄️ Backing up database..."
        docker exec tesvik360-postgres pg_dump -U tesvik360_user tesvik360 > "$BACKUP_DIR/$BACKUP_NAME/database.sql"
    fi
    
    # Backup uploads
    if [ -d "backend/uploads" ]; then
        echo "📁 Backing up uploads..."
        cp -r backend/uploads "$BACKUP_DIR/$BACKUP_NAME/"
    fi
    
    echo "✅ Backup created: $BACKUP_NAME"
}

# Function to pull latest code
pull_code() {
    echo "📥 Pulling latest code..."
    if [ -d ".git" ]; then
        git fetch origin
        git reset --hard origin/main
    else
        echo "❌ Git repository not found. Please clone the repository first."
        exit 1
    fi
}

# Function to build and deploy
deploy() {
    echo "🔨 Building and deploying containers..."
    
    # Copy environment file
    if [ -f "$ENV_FILE" ]; then
        cp $ENV_FILE .env
    else
        echo "❌ Environment file $ENV_FILE not found!"
        exit 1
    fi
    
    # Build and start containers
    docker-compose -f $COMPOSE_FILE down --remove-orphans
    docker-compose -f $COMPOSE_FILE build --no-cache
    docker-compose -f $COMPOSE_FILE up -d
    
    # Wait for services to be healthy
    echo "⏳ Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    if docker-compose -f $COMPOSE_FILE ps | grep -q "unhealthy\|Exit"; then
        echo "❌ Some services are not healthy. Rolling back..."
        docker-compose -f $COMPOSE_FILE logs
        exit 1
    fi
    
    echo "✅ Deployment completed successfully!"
}

# Function to cleanup old images
cleanup() {
    echo "🧹 Cleaning up old Docker images..."
    docker image prune -f
    docker system prune -f --volumes
}

# Function to show status
show_status() {
    echo "📊 Service Status:"
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    echo "🔍 Service Logs (last 20 lines):"
    docker-compose -f $COMPOSE_FILE logs --tail=20
}

# Main deployment process
main() {
    case "${1:-deploy}" in
        "backup")
            create_backup
            ;;
        "pull")
            pull_code
            ;;
        "deploy")
            create_backup
            pull_code
            deploy
            cleanup
            show_status
            ;;
        "status")
            show_status
            ;;
        "logs")
            docker-compose -f $COMPOSE_FILE logs -f
            ;;
        "restart")
            echo "🔄 Restarting services..."
            docker-compose -f $COMPOSE_FILE restart
            show_status
            ;;
        "stop")
            echo "🛑 Stopping services..."
            docker-compose -f $COMPOSE_FILE down
            ;;
        "start")
            echo "▶️ Starting services..."
            docker-compose -f $COMPOSE_FILE up -d
            show_status
            ;;
        *)
            echo "Usage: $0 {deploy|backup|pull|status|logs|restart|stop|start}"
            echo ""
            echo "Commands:"
            echo "  deploy  - Full deployment (backup, pull, build, deploy)"
            echo "  backup  - Create backup only"
            echo "  pull    - Pull latest code only"
            echo "  status  - Show service status"
            echo "  logs    - Show service logs"
            echo "  restart - Restart all services"
            echo "  stop    - Stop all services"
            echo "  start   - Start all services"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"