const { Client } = require('pg');

async function resetDatabase() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'tesvik_admin',
    password: 'tesvik123',
    database: 'postgres'
  });

  try {
    await client.connect();
    
    // Tüm bağlantıları sonlandır
    await client.query("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'tesvik360_db' AND pid <> pg_backend_pid()");
    
    // Veritabanını sil
    await client.query('DROP DATABASE IF EXISTS tesvik360_db');
    
    // Yeni veritabanı oluştur
    await client.query('CREATE DATABASE tesvik360_db');
    
    console.log('✅ Veritabanı başarıyla sıfırlandı');
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await client.end();
  }
}

resetDatabase();