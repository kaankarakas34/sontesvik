const { Sequelize } = require('sequelize');

// Sequelize instance - logging tamamen kapalı
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: '127.0.0.1',
  port: 5433,
  database: 'tesvik360_db',
  username: 'tesvik_admin',
  password: 'tesvik123',
  logging: false, // Tüm SQL loglarını kapat
  define: {
    timestamps: true,
    underscored: true
  }
});

// Model'leri import et
const User = require('./backend/src/models/User')(sequelize, Sequelize.DataTypes);
const Application = require('./backend/src/models/Application')(sequelize, Sequelize.DataTypes);
const Incentive = require('./backend/src/models/Incentive')(sequelize, Sequelize.DataTypes);
const Sector = require('./backend/src/models/Sector')(sequelize, Sequelize.DataTypes);
const ApplicationIncentive = require('./backend/src/models/ApplicationIncentive')(sequelize, Sequelize.DataTypes);
const ConsultantAssignmentService = require('./backend/src/services/ConsultantAssignmentService');

// Model ilişkilerini kur
User.hasMany(Application, { foreignKey: 'userId', as: 'applications' });
Application.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Application.belongsTo(User, { foreignKey: 'assignedConsultantId', as: 'assignedConsultant' });
Application.belongsToMany(Incentive, { through: ApplicationIncentive, foreignKey: 'applicationId', as: 'incentives' });
Incentive.belongsToMany(Application, { through: ApplicationIncentive, foreignKey: 'incentiveId', as: 'applications' });
User.belongsTo(Sector, { foreignKey: 'sectorId', as: 'sector' });
Incentive.belongsTo(Sector, { foreignKey: 'sectorId', as: 'sector' });

const { Op } = require('sequelize');

async function testConsultantAssignment() {
  try {
    console.log('🔍 Danışman atama testi başlıyor...\n');

    // 1. Sektörü olan bir kullanıcı bul
    const user = await User.findOne({
      where: { 
        sectorId: { [Op.ne]: null }
      },
      include: [
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!user) {
      console.log('❌ Sektörü olan kullanıcı bulunamadı');
      return;
    }

    console.log(`✅ Test kullanıcısı: ${user.firstName} ${user.lastName}`);
    console.log(`   Sektör: ${user.sector ? user.sector.name : 'Bilinmiyor'} (ID: ${user.sectorId})\n`);

    // 2. Aktif teşvik bul
    const incentive = await Incentive.findOne({
      where: { status: 'active' }
    });

    if (!incentive) {
      console.log('❌ Aktif teşvik bulunamadı');
      return;
    }

    console.log(`✅ Test teşviki: ${incentive.title}\n`);

    // 3. Yeni başvuru oluştur
    const application = await Application.create({
      userId: user.id,
      status: 'submitted',
      requestedAmount: 150000.00,
      projectTitle: 'Danışman Atama Test Projesi',
      projectDescription: 'Bu proje danışman atama sistemini test etmek için oluşturulmuştur.',
      applicationData: {
        companyName: 'Test Şirketi A.Ş.',
        projectTitle: 'Danışman Atama Test Projesi'
      }
    });

    console.log(`✅ Yeni başvuru oluşturuldu: ${application.id}\n`);

    // 4. Başvuruya teşvik ekle
    await ApplicationIncentive.create({
      applicationId: application.id,
      incentiveId: incentive.id,
      status: 'selected'
    });

    console.log('✅ Başvuruya teşvik eklendi\n');

    // 5. Otomatik danışman ataması yap
    console.log('🔄 Otomatik danışman ataması başlatılıyor...');
    const assignmentResult = await ConsultantAssignmentService.autoAssignConsultant(
      application.id, 
      user.sectorId
    );

    console.log('\n📋 Atama Sonucu:');
    if (assignmentResult.success) {
      console.log(`✅ Başarılı: ${assignmentResult.consultantName}`);
      console.log(`   Danışman ID: ${assignmentResult.consultantId}`);
      console.log(`   Atama ID: ${assignmentResult.assignmentId || 'Belirtilmemiş'}`);
    } else {
      console.log(`❌ Başarısız: ${assignmentResult.message}`);
      if (assignmentResult.error) {
        console.log(`   Hata: ${assignmentResult.error}`);
      }
    }

    // 6. Final durumu kontrol et
    const finalApplication = await Application.findByPk(application.id, {
      include: [
        {
          model: User,
          as: 'assignedConsultant',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    console.log('\n📊 Final Durum:');
    console.log(`   Başvuru ID: ${finalApplication.id}`);
    if (finalApplication.assignedConsultant) {
      console.log(`   ✅ Atanan Danışman: ${finalApplication.assignedConsultant.firstName} ${finalApplication.assignedConsultant.lastName}`);
      console.log(`   📧 E-posta: ${finalApplication.assignedConsultant.email}`);
      console.log(`   📅 Atama Tarihi: ${finalApplication.consultantAssignedAt ? new Date(finalApplication.consultantAssignedAt).toLocaleString('tr-TR') : 'Belirtilmemiş'}`);
    } else {
      console.log('   ❌ Danışman atanmamış');
    }

    console.log('\n🎉 Test tamamlandı!');

  } catch (error) {
    console.error('\n❌ Test sırasında hata:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    await sequelize.close();
  }
}

testConsultantAssignment();