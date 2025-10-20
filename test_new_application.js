const { Sequelize } = require('sequelize');
const path = require('path');

// Backend ile aynı veritabanı konfigürasyonunu kullan
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: '127.0.0.1',
  port: 5433,
  database: 'tesvik360_db',
  username: 'tesvik_admin',
  password: 'tesvik123',
  logging: false, // SQL loglarını tamamen kapat
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

async function testNewApplication() {
  try {
    console.log('Test başlıyor: Yeni başvuru oluşturma ve danışman ataması...\n');

    // Sektörü olan bir test kullanıcısı bul
    const user = await User.findOne({
      where: { 
        sectorId: { [Op.ne]: null }
      }
    });

    if (!user) {
      console.log('❌ Sektörü olan kullanıcı bulunamadı');
      return;
    }

    console.log(`✅ Test kullanıcısı bulundu: ${user.firstName} ${user.lastName} (Sektör ID: ${user.sectorId})`);

    // Kullanıcının sektör bilgisini al
    const userWithSector = await User.findByPk(user.id, {
      include: [
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    console.log(`   Sektör: ${userWithSector.sector ? userWithSector.sector.name : 'Bilinmiyor'}`);

    // Aktif bir teşvik bul
    const incentive = await Incentive.findOne({
      where: { 
        status: 'active'
      },
      include: [
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!incentive) {
      console.log('❌ Aktif teşvik bulunamadı');
      return;
    }

    console.log(`✅ Test teşviki bulundu: ${incentive.title}`);

    // Yeni başvuru oluştur
    const application = await Application.create({
      userId: user.id,
      status: 'draft',
      requestedAmount: 100000.00,
      projectTitle: 'Test Projesi - Danışman Atama Testi',
      projectDescription: 'Bu proje danışman atama sistemini test etmek için oluşturulmuştur.',
      applicationData: {
        companyName: 'Test Şirketi',
        projectTitle: 'Test Projesi',
        projectDescription: 'Test amaçlı oluşturulan proje'
      }
    });

    console.log(`✅ Yeni başvuru oluşturuldu: ${application.id}`);

    // Başvuruya teşvik ekle
    await ApplicationIncentive.create({
      applicationId: application.id,
      incentiveId: incentive.id,
      status: 'selected'
    });

    console.log('✅ Başvuruya teşvik eklendi');

    // Başvuru durumunu submitted yap (danışman ataması için)
    await application.update({ status: 'submitted' });
    console.log('✅ Başvuru durumu "submitted" olarak güncellendi');

    // Otomatik danışman ataması yap
    console.log('\n🔄 Otomatik danışman ataması başlatılıyor...');
    const assignmentResult = await ConsultantAssignmentService.autoAssignConsultant(application.id, user.sectorId);

    if (assignmentResult.success) {
      console.log(`✅ Danışman ataması başarılı: ${assignmentResult.consultantName}`);
      console.log(`   Danışman ID: ${assignmentResult.consultantId}`);
      console.log(`   Atama ID: ${assignmentResult.assignmentId}`);
    } else {
      console.log(`❌ Danışman ataması başarısız: ${assignmentResult.message}`);
      if (assignmentResult.error) {
        console.log(`   Hata detayı: ${assignmentResult.error}`);
      }
    }

    // Başvuruyu danışman bilgileriyle birlikte tekrar getir
    const updatedApplication = await Application.findByPk(application.id, {
      include: [
        {
          model: User,
          as: 'assignedConsultant',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'consultantRating']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'sector']
        }
      ]
    });

    console.log('\n📋 Final durum:');
    console.log(`   Başvuru ID: ${updatedApplication.id}`);
    console.log(`   Başvuran: ${updatedApplication.user.firstName} ${updatedApplication.user.lastName}`);
    
    if (updatedApplication.assignedConsultant) {
      console.log(`   Atanan Danışman: ${updatedApplication.assignedConsultant.firstName} ${updatedApplication.assignedConsultant.lastName}`);
      console.log(`   Danışman E-posta: ${updatedApplication.assignedConsultant.email}`);
      console.log(`   Danışman Puanı: ${updatedApplication.assignedConsultant.consultantRating || 'Belirtilmemiş'}`);
      console.log('✅ Test başarıyla tamamlandı!');
    } else {
      console.log('❌ Danışman ataması yapılmamış!');
    }

  } catch (error) {
    console.error('❌ Test sırasında hata oluştu:', error.message);
    console.error('Detay:', error);
  }
}

testNewApplication();