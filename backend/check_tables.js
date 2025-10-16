const { sequelize } = require('./src/config/database');

async function checkTables() {
  try {
    // Tabloları kontrol et
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = current_schema() 
      AND table_type = 'BASE TABLE'
    `);
    
    console.log('📊 Tablolar:');
    tables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    // SequelizeMeta kontrolü
    const [sequelizeMeta] = await sequelize.query(`
      SELECT * FROM information_schema.tables 
      WHERE table_name = 'SequelizeMeta'
    `);
    
    if (sequelizeMeta.length > 0) {
      console.log('\n📋 SequelizeMeta tablosu var');
      const [migrations] = await sequelize.query('SELECT name FROM "SequelizeMeta" ORDER BY name');
      console.log('Migrationlar:');
      migrations.forEach(mig => console.log(`- ${mig.name}`));
    } else {
      console.log('\n⚠️ SequelizeMeta tablosu yok');
    }
    
    // User tablosu kontrolü
    const userTable = tables.find(t => t.table_name === 'Users');
    if (userTable) {
      const [userCount] = await sequelize.query('SELECT COUNT(*) as count FROM "Users"');
      console.log(`\n👥 Users tablosunda ${userCount[0].count} kayıt var`);
      
      if (userCount[0].count > 0) {
        const [users] = await sequelize.query('SELECT id, email, role, status, "createdAt" FROM "Users" ORDER BY "createdAt" DESC LIMIT 5');
        console.log('Son kullanıcılar:');
        users.forEach(user => {
          console.log(`- ${user.email} (${user.role}, ${user.status}) - ${user.createdAt}`);
        });
      }
    }
    
    // Sector tablosu kontrolü
    const sectorTable = tables.find(t => t.table_name === 'Sectors');
    if (sectorTable) {
      const [sectorCount] = await sequelize.query('SELECT COUNT(*) as count FROM "Sectors"');
      console.log(`\n🏢 Sectors tablosunda ${sectorCount[0].count} kayıt var`);
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await sequelize.close();
  }
}

checkTables();