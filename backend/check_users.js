const { sequelize } = require('./src/config/database');

async function checkUsers() {
  try {
    // Kullanıcıları kontrol et
    const [users] = await sequelize.query(`
      SELECT email, role, status, created_at, updated_at, sector_id 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    console.log('👥 Kullanıcılar:');
    users.forEach(user => {
      console.log(`${user.email} - ${user.role} - ${user.status} - Sektör: ${user.sector_id || 'Yok'}`);
      console.log(`  Oluşturulma: ${user.created_at}`);
      console.log(`  Güncelleme: ${user.updated_at}`);
      console.log('');
    });
    
    // Kullanıcı sayısını kontrol et
    const [userCount] = await sequelize.query('SELECT COUNT(*) as count FROM users');
    console.log(`📊 Toplam ${userCount[0].count} kullanıcı var`);
    
    // kullanici@test.com kullanıcısını bul
    const [targetUser] = await sequelize.query(`
      SELECT id, email, role, status, sector_id, created_at 
      FROM users 
      WHERE email = 'kullanici@test.com'
    `);
    
    if (targetUser.length > 0) {
      console.log(`\n🎯 Hedef kullanıcı bulundu:`);
      console.log(`  Email: ${targetUser[0].email}`);
      console.log(`  ID: ${targetUser[0].id}`);
      console.log(`  Rol: ${targetUser[0].role}`);
      console.log(`  Durum: ${targetUser[0].status}`);
      console.log(`  Sektör ID: ${targetUser[0].sector_id || 'Yok'}`);
    } else {
      console.log(`\n❌ kullanici@test.com kullanıcısı bulunamadı`);
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await sequelize.close();
  }
}

checkUsers();