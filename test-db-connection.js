#!/usr/bin/env node

/**
 * Veritabanı Bağlantı Test Scripti
 * Bu script local PostgreSQL bağlantısını test eder
 */

const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env.local' });

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testDatabaseConnection() {
  log('\n🔍 Veritabanı Bağlantı Testi Başlatılıyor...', colors.cyan);
  log('=' .repeat(50), colors.blue);

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'tesvik360_local',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  };

  log('\n📋 Bağlantı Bilgileri:', colors.yellow);
  log(`   Host: ${config.host}`, colors.reset);
  log(`   Port: ${config.port}`, colors.reset);
  log(`   Database: ${config.database}`, colors.reset);
  log(`   User: ${config.user}`, colors.reset);
  log(`   Password: ${'*'.repeat(config.password.length)}`, colors.reset);

  const client = new Client(config);

  try {
    log('\n🔌 Veritabanına bağlanılıyor...', colors.yellow);
    await client.connect();
    log('✅ Veritabanı bağlantısı başarılı!', colors.green);

    // Veritabanı versiyonunu kontrol et
    const versionResult = await client.query('SELECT version()');
    log(`\n📊 PostgreSQL Versiyonu:`, colors.cyan);
    log(`   ${versionResult.rows[0].version}`, colors.reset);

    // Mevcut tabloları listele
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    log(`\n📋 Mevcut Tablolar (${tablesResult.rows.length} adet):`, colors.cyan);
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach(row => {
        log(`   ✓ ${row.table_name}`, colors.green);
      });
    } else {
      log('   ⚠️  Henüz tablo oluşturulmamış', colors.yellow);
      log('   💡 database_schema.sql dosyasını çalıştırmanız gerekebilir', colors.blue);
    }

    // Basit bir test sorgusu
    const testResult = await client.query('SELECT NOW() as current_time');
    log(`\n⏰ Sunucu Zamanı: ${testResult.rows[0].current_time}`, colors.magenta);

  } catch (error) {
    log('\n❌ Veritabanı bağlantı hatası:', colors.red);
    log(`   ${error.message}`, colors.red);
    
    log('\n🔧 Olası Çözümler:', colors.yellow);
    log('   1. PostgreSQL servisinin çalıştığından emin olun', colors.reset);
    log('   2. Bağlantı bilgilerini kontrol edin (.env.local)', colors.reset);
    log('   3. Veritabanının oluşturulduğundan emin olun', colors.reset);
    log('   4. Firewall ayarlarını kontrol edin', colors.reset);
    
    if (error.code === 'ECONNREFUSED') {
      log('\n💡 PostgreSQL çalışmıyor olabilir. Başlatmak için:', colors.blue);
      log('   • Docker ile: npm run db:setup', colors.reset);
      log('   • Local kurulum: PostgreSQL servisini başlatın', colors.reset);
    }
    
    process.exit(1);
  } finally {
    await client.end();
    log('\n🔌 Bağlantı kapatıldı.', colors.cyan);
  }

  log('\n✅ Test tamamlandı!', colors.green);
  log('=' .repeat(50), colors.blue);
}

// Script'i çalıştır
if (require.main === module) {
  testDatabaseConnection().catch(console.error);
}

module.exports = { testDatabaseConnection };