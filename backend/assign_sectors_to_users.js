const { User, Sector } = require('./src/models');
const { sequelize } = require('./src/config/database');

async function assignSectorsToUsers() {
  try {
    await sequelize.authenticate();
    console.log('=== SEKTÖRÜ OLMAYAN KULLANICILARA SEKTÖR ATAMA ===');
    
    // Aktif sektörleri al
    const sectors = await Sector.findAll({
      where: {
        isActive: true
      },
      attributes: ['id', 'name']
    });
    
    console.log(`Aktif sektör sayısı: ${sectors.length}`);
    sectors.forEach(sector => {
      console.log(`- ${sector.name} (${sector.id})`);
    });
    
    // Sektörü olmayan kullanıcıları bul
    const usersWithoutSector = await User.findAll({
      where: {
        sectorId: null,
        role: ['user', 'member'] // Normal kullanıcılar
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'role']
    });
    
    console.log(`\nSektörü olmayan kullanıcı sayısı: ${usersWithoutSector.length}`);
    
    let assignedCount = 0;
    
    for (const user of usersWithoutSector) {
      // Rastgele sektör seç
      const randomSector = sectors[Math.floor(Math.random() * sectors.length)];
      
      try {
        await User.update(
          { sectorId: randomSector.id },
          { where: { id: user.id } }
        );
        
        console.log(`✅ ${user.firstName} ${user.lastName} -> ${randomSector.name}`);
        assignedCount++;
      } catch (error) {
        console.log(`❌ ${user.firstName} ${user.lastName} -> Hata: ${error.message}`);
      }
    }
    
    console.log(`\n=== ÖZET ===`);
    console.log(`✅ Sektör atanan kullanıcı: ${assignedCount}`);
    console.log(`❌ Başarısız: ${usersWithoutSector.length - assignedCount}`);
    
    // Kontrol et
    const stillWithoutSector = await User.count({
      where: {
        sectorId: null,
        role: ['user', 'member']
      }
    });
    
    console.log(`Hala sektörü olmayan kullanıcı: ${stillWithoutSector}`);
    
  } catch (error) {
    console.error('Hata:', error.message);
  } finally {
    process.exit(0);
  }
}

assignSectorsToUsers();