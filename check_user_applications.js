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
const Application = require('./backend/src/models/Application')(sequelize, Sequelize.DataTypes);
const Sector = require('./backend/src/models/Sector')(sequelize, Sequelize.DataTypes);

// Model ilişkilerini kur
User.hasMany(Application, { foreignKey: 'userId', as: 'applications' });
Application.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Application.belongsTo(User, { foreignKey: 'assignedConsultantId', as: 'assignedConsultant' });
User.belongsTo(Sector, { foreignKey: 'sectorId', as: 'sector' });

async function checkUserApplications() {
  try {
    console.log('🔍 kullanici@test.com kullanıcısının başvuruları kontrol ediliyor...\n');

    // 1. Kullanıcıyı bul
    const user = await User.findOne({
      where: { email: 'kullanici@test.com' },
      include: [
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!user) {
      console.log('❌ kullanici@test.com bulunamadı');
      return;
    }

    console.log(`✅ Kullanıcı bulundu: ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Sektör: ${user.sector ? user.sector.name : 'Belirtilmemiş'} (ID: ${user.sectorId})`);
    console.log(`   Rol: ${user.role}\n`);

    // 2. Kullanıcının tüm başvurularını getir
    const applications = await Application.findAll({
      where: { userId: user.id },
      include: [
        {
          model: User,
          as: 'assignedConsultant',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          include: [
            {
              model: Sector,
              as: 'sector',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`📊 Toplam başvuru sayısı: ${applications.length}\n`);

    if (applications.length === 0) {
      console.log('ℹ️ Bu kullanıcının hiç başvurusu yok.');
      return;
    }

    // 3. Başvuruları listele
    let assignedCount = 0;
    let unassignedCount = 0;

    applications.forEach((app, index) => {
      console.log(`${index + 1}. BAŞVURU (ID: ${app.id})`);
      console.log(`   📅 Oluşturulma: ${new Date(app.createdAt).toLocaleString('tr-TR')}`);
      console.log(`   📋 Proje: ${app.projectTitle || 'Belirtilmemiş'}`);
      console.log(`   💰 Talep Edilen Tutar: ${app.requestedAmount ? app.requestedAmount.toLocaleString('tr-TR') + ' TL' : 'Belirtilmemiş'}`);
      console.log(`   📊 Durum: ${app.status}`);
      
      if (app.assignedConsultant) {
        console.log(`   ✅ Atanan Danışman: ${app.assignedConsultant.firstName} ${app.assignedConsultant.lastName}`);
        console.log(`   📧 Danışman Email: ${app.assignedConsultant.email}`);
        console.log(`   🎯 Danışman Sektörü: ${app.assignedConsultant.sector ? app.assignedConsultant.sector.name : 'Belirtilmemiş'}`);
        console.log(`   📅 Atama Tarihi: ${app.consultantAssignedAt ? new Date(app.consultantAssignedAt).toLocaleString('tr-TR') : 'Belirtilmemiş'}`);
        assignedCount++;
      } else {
        console.log(`   ❌ Danışman: ATANMAMIŞ`);
        unassignedCount++;
      }
      console.log('   ' + '-'.repeat(60));
    });

    // 4. Özet
    console.log(`\n=== ÖZET ===`);
    console.log(`✅ Danışman atanmış başvuru: ${assignedCount}`);
    console.log(`❌ Danışman atanmamış başvuru: ${unassignedCount}`);
    console.log(`📊 Atama oranı: ${applications.length > 0 ? ((assignedCount / applications.length) * 100).toFixed(1) : 0}%`);

    // 5. Danışman atanmamış başvuruları ayrıca listele
    if (unassignedCount > 0) {
      console.log(`\n🔴 DANIŞMAN ATANMAMIŞ BAŞVURULAR:`);
      const unassignedApps = applications.filter(app => !app.assignedConsultant);
      unassignedApps.forEach((app, index) => {
        console.log(`   ${index + 1}. ${app.id} - ${app.projectTitle || 'Proje adı yok'} (${app.status})`);
      });
    }

  } catch (error) {
    console.error('❌ Hata:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    await sequelize.close();
  }
}

checkUserApplications();