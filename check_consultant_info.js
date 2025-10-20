const { Sequelize } = require('sequelize');

// Sequelize instance
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: '127.0.0.1',
  port: 5433,
  database: 'tesvik360_db',
  username: 'tesvik_admin',
  password: 'tesvik123',
  logging: false,
  define: {
    timestamps: true,
    underscored: true
  }
});

// Model'leri import et
const User = require('./backend/src/models/User')(sequelize, Sequelize.DataTypes);
const Sector = require('./backend/src/models/Sector')(sequelize, Sequelize.DataTypes);

// Model ilişkilerini kur
User.belongsTo(Sector, { foreignKey: 'sectorId', as: 'sector' });

async function checkConsultantInfo() {
  try {
    console.log('🔍 danisman@test.com danışmanının bilgileri kontrol ediliyor...\n');

    // 1. Danışmanı bul
    const consultant = await User.findOne({
      where: { email: 'danisman@test.com' },
      include: [
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!consultant) {
      console.log('❌ danisman@test.com bulunamadı');
      return;
    }

    console.log(`✅ Danışman bulundu:`);
    console.log(`   👤 Ad Soyad: ${consultant.firstName} ${consultant.lastName}`);
    console.log(`   📧 Email: ${consultant.email}`);
    console.log(`   🎯 Rol: ${consultant.role}`);
    console.log(`   🏢 Sektör: ${consultant.sector ? consultant.sector.name : 'Belirtilmemiş'} (ID: ${consultant.sectorId})`);
    console.log(`   📞 Telefon: ${consultant.phone || 'Belirtilmemiş'}`);
    console.log(`   ⭐ Puan: ${consultant.score || 'Belirtilmemiş'}`);
    console.log(`   📅 Kayıt Tarihi: ${new Date(consultant.createdAt).toLocaleString('tr-TR')}\n`);

    // 2. Sağlık sektörünü kontrol et
    const healthSector = await Sector.findOne({
      where: { name: 'Sağlık' }
    });

    if (healthSector) {
      console.log(`🏥 Sağlık sektörü ID: ${healthSector.id}`);
      
      if (consultant.sectorId === healthSector.id) {
        console.log(`✅ Danışman zaten sağlık sektöründe!`);
      } else {
        console.log(`⚠️ Danışman sağlık sektöründe değil. Güncelleme gerekli.`);
        console.log(`   Mevcut sektör: ${consultant.sector ? consultant.sector.name : 'Belirtilmemiş'} (ID: ${consultant.sectorId})`);
        console.log(`   Hedef sektör: Sağlık (ID: ${healthSector.id})`);
      }
    } else {
      console.log(`❌ Sağlık sektörü bulunamadı!`);
    }

    // 3. Tüm sektörleri listele
    console.log(`\n📋 Mevcut sektörler:`);
    const allSectors = await Sector.findAll({
      order: [['name', 'ASC']]
    });

    allSectors.forEach((sector, index) => {
      const isCurrent = consultant.sectorId === sector.id ? ' ← MEVCUT' : '';
      const isHealth = sector.name === 'Sağlık' ? ' ← HEDEF' : '';
      console.log(`   ${index + 1}. ${sector.name} (ID: ${sector.id})${isCurrent}${isHealth}`);
    });

    return {
      consultant,
      healthSector,
      needsUpdate: consultant.sectorId !== (healthSector ? healthSector.id : null)
    };

  } catch (error) {
    console.error('❌ Hata:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    await sequelize.close();
  }
}

checkConsultantInfo();