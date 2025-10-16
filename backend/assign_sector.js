const { sequelize } = require('./src/config/database');

async function assignSectorToUser() {
  try {
    // Sağlık sektörünü bul
    const [healthSectors] = await sequelize.query(`
      SELECT id, name, code 
      FROM "Sectors" 
      WHERE code = 'HEALTH'
    `);
    
    if (healthSectors.length === 0) {
      console.log('❌ Sağlık sektörü bulunamadı');
      return;
    }
    
    const healthSector = healthSectors[0];
    console.log(`✅ Sağlık sektörü bulundu: ${healthSector.name} (ID: ${healthSector.id})`);
    
    // kullanici@test.com kullanıcısını bul
    const [users] = await sequelize.query(`
      SELECT id, email, sector_id 
      FROM "users" 
      WHERE email = 'kullanici@test.com'
    `);
    
    if (users.length === 0) {
      console.log('❌ kullanici@test.com kullanıcısı bulunamadı');
      return;
    }
    
    const user = users[0];
    console.log(`✅ Kullanıcı bulundu: ${user.email} (ID: ${user.id})`);
    
    // Kullanıcıyı sağlık sektörüne ata
    await sequelize.query(`
      UPDATE "users" 
      SET sector_id = '${healthSector.id}' 
      WHERE id = '${user.id}'
    `);
    
    console.log(`✅ ${user.email} kullanıcısı ${healthSector.name} sektörüne atandı`);
    
    // Güncellenmiş kullanıcı bilgilerini göster
    const [updatedUser] = await sequelize.query(`
      SELECT u.id, u.email, u.sector_id, s.name as sector_name 
      FROM "users" u
      LEFT JOIN "Sectors" s ON u.sector_id = s.id
      WHERE u.id = '${user.id}'
    `);
    
    console.log(`\n📋 Güncellenmiş kullanıcı bilgileri:`);
    console.log(`  Email: ${updatedUser[0].email}`);
    console.log(`  Sektör: ${updatedUser[0].sector_name}`);
    console.log(`  Sektör ID: ${updatedUser[0].sector_id}`);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await sequelize.close();
  }
}

assignSectorToUser();