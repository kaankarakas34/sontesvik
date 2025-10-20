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

async function assignConsultantToUserApplications() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('🔄 kullanici@test.com\'un başvurularına danisman@test.com atanıyor...\n');

    // 1. Kullanıcıyı bul
    const user = await User.findOne({
      where: { email: 'kullanici@test.com' }
    });

    if (!user) {
      console.log('❌ kullanici@test.com bulunamadı');
      return;
    }

    // 2. Danışmanı bul
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

    console.log(`✅ Kullanıcı: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`✅ Danışman: ${consultant.firstName} ${consultant.lastName} (${consultant.email})`);
    console.log(`   Danışman Sektörü: ${consultant.sector ? consultant.sector.name : 'Belirtilmemiş'}\n`);

    // 3. Kullanıcının tüm başvurularını getir
    const applications = await Application.findAll({
      where: { userId: user.id },
      include: [
        {
          model: User,
          as: 'assignedConsultant',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`📊 Toplam başvuru sayısı: ${applications.length}\n`);

    if (applications.length === 0) {
      console.log('ℹ️ Bu kullanıcının hiç başvurusu yok.');
      await transaction.rollback();
      return;
    }

    // 4. Başvuruları kategorize et
    const alreadyAssignedToTarget = applications.filter(app => 
      app.assignedConsultantId === consultant.id
    );
    const assignedToOthers = applications.filter(app => 
      app.assignedConsultantId && app.assignedConsultantId !== consultant.id
    );
    const unassigned = applications.filter(app => !app.assignedConsultantId);

    console.log(`📋 Başvuru durumu:`);
    console.log(`   ✅ Zaten ${consultant.firstName} ${consultant.lastName}'a atanmış: ${alreadyAssignedToTarget.length}`);
    console.log(`   🔄 Başka danışmana atanmış (güncellenecek): ${assignedToOthers.length}`);
    console.log(`   ❌ Atanmamış (yeni atanacak): ${unassigned.length}\n`);

    // 5. Atama işlemlerini gerçekleştir
    const applicationsToUpdate = [...assignedToOthers, ...unassigned];
    let successCount = 0;
    let errorCount = 0;

    if (applicationsToUpdate.length > 0) {
      console.log(`🔄 ${applicationsToUpdate.length} başvuru güncelleniyor...\n`);

      for (const app of applicationsToUpdate) {
        try {
          const oldConsultant = app.assignedConsultant;
          
          await app.update({
            assignedConsultantId: consultant.id,
            consultantAssignedAt: new Date()
          }, { transaction });

          successCount++;
          
          console.log(`✅ ${successCount}. Başvuru güncellendi:`);
          console.log(`   📋 ID: ${app.id}`);
          console.log(`   📝 Proje: ${app.projectTitle || 'Belirtilmemiş'}`);
          console.log(`   👤 Eski Danışman: ${oldConsultant ? `${oldConsultant.firstName} ${oldConsultant.lastName}` : 'Yok'}`);
          console.log(`   👤 Yeni Danışman: ${consultant.firstName} ${consultant.lastName}`);
          console.log(`   📅 Atama Zamanı: ${new Date().toLocaleString('tr-TR')}`);
          console.log('   ' + '-'.repeat(60));

        } catch (error) {
          errorCount++;
          console.error(`❌ Başvuru ${app.id} güncellenirken hata:`, error.message);
        }
      }
    }

    // 6. Transaction'ı commit et
    await transaction.commit();

    // 7. Sonuçları özetle
    console.log(`\n=== ATAMA SONUÇLARI ===`);
    console.log(`✅ Başarıyla güncellenen: ${successCount}`);
    console.log(`❌ Hata alan: ${errorCount}`);
    console.log(`ℹ️ Zaten atanmış olan: ${alreadyAssignedToTarget.length}`);
    console.log(`📊 Toplam işlem: ${applications.length}`);
    
    const finalAssignedCount = alreadyAssignedToTarget.length + successCount;
    console.log(`\n🎯 FINAL DURUM:`);
    console.log(`   ${consultant.firstName} ${consultant.lastName}'a atanan toplam başvuru: ${finalAssignedCount}/${applications.length}`);
    console.log(`   Atama oranı: ${((finalAssignedCount / applications.length) * 100).toFixed(1)}%`);

    if (finalAssignedCount === applications.length) {
      console.log(`\n🎉 TÜM BAŞVURULAR BAŞARIYLA ATANDI!`);
    }

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Genel hata:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    await sequelize.close();
  }
}

assignConsultantToUserApplications();