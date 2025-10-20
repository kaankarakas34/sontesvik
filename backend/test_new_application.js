const { Sequelize } = require('sequelize');
const { User, Application, Incentive, Sector } = require('./src/models');
const { ConsultantAssignmentService } = require('./src/services/consultantAssignmentService');

async function testNewApplication() {
  try {
    console.log('🧪 Yeni başvuru oluşturma ve danışman atama testi başlıyor...\n');

    // 1. Test kullanıcısını bul (sektörü olan bir kullanıcı)
    const testUser = await User.findOne({
      where: {
        role: 'member',
        sectorId: { [Sequelize.Op.not]: null }
      },
      include: [{
        model: Sector,
        as: 'sector'
      }]
    });

    if (!testUser) {
      console.log('❌ Sektörü olan test kullanıcısı bulunamadı');
      return;
    }

    console.log('👤 Test kullanıcısı:', {
      id: testUser.id,
      name: `${testUser.firstName} ${testUser.lastName}`,
      email: testUser.email,
      sector: testUser.sector?.name || 'Bilinmiyor'
    });

    // 2. Aktif bir teşvik bul
    const incentive = await Incentive.findOne({
      where: { isActive: true }
    });

    if (!incentive) {
      console.log('❌ Aktif teşvik bulunamadı');
      return;
    }

    console.log('🎯 Seçilen teşvik:', {
      id: incentive.id,
      title: incentive.title
    });

    // 3. Yeni başvuru oluştur
    const applicationData = {
      userId: testUser.id,
      incentiveId: incentive.id,
      projectTitle: 'Test Projesi - Otomatik Danışman Atama Testi',
      projectDescription: 'Bu başvuru otomatik danışman atama sistemini test etmek için oluşturulmuştur.',
      requestedAmount: 50000,
      currency: 'TRY',
      status: 'draft'
    };

    console.log('\n📝 Yeni başvuru oluşturuluyor...');
    const newApplication = await Application.create(applicationData);
    console.log('✅ Başvuru oluşturuldu:', {
      id: newApplication.id,
      applicationNumber: newApplication.applicationNumber,
      status: newApplication.status
    });

    // 4. Otomatik danışman ataması yap
    console.log('\n🔄 Otomatik danışman ataması başlatılıyor...');
    const assignmentResult = await ConsultantAssignmentService.autoAssignConsultant(
      newApplication.id,
      testUser.sectorId
    );

    if (assignmentResult.success) {
      console.log('✅ Danışman ataması başarılı:', {
        consultantId: assignmentResult.consultant.id,
        consultantName: `${assignmentResult.consultant.firstName} ${assignmentResult.consultant.lastName}`,
        consultantEmail: assignmentResult.consultant.email,
        consultantSector: assignmentResult.consultant.sector?.name || 'Bilinmiyor'
      });
    } else {
      console.log('❌ Danışman ataması başarısız:', assignmentResult.message);
    }

    // 5. Başvuruyu tekrar getir ve danışman bilgisini kontrol et
    console.log('\n🔍 Başvuru detayları kontrol ediliyor...');
    const updatedApplication = await Application.findByPk(newApplication.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'assignedConsultant',
          attributes: ['id', 'firstName', 'lastName', 'email', 'consultantRating'],
          include: [{
            model: Sector,
            as: 'sector',
            attributes: ['name']
          }]
        },
        {
          model: Incentive,
          as: 'incentive',
          attributes: ['title']
        }
      ]
    });

    console.log('\n📊 Final Başvuru Durumu:');
    console.log('- Başvuru ID:', updatedApplication.id);
    console.log('- Başvuru Numarası:', updatedApplication.applicationNumber);
    console.log('- Başvuran:', `${updatedApplication.user.firstName} ${updatedApplication.user.lastName}`);
    console.log('- Teşvik:', updatedApplication.incentive.title);
    
    if (updatedApplication.assignedConsultant) {
      console.log('- Atanan Danışman:', `${updatedApplication.assignedConsultant.firstName} ${updatedApplication.assignedConsultant.lastName}`);
      console.log('- Danışman Email:', updatedApplication.assignedConsultant.email);
      console.log('- Danışman Sektörü:', updatedApplication.assignedConsultant.sector?.name || 'Bilinmiyor');
      console.log('- Danışman Puanı:', updatedApplication.assignedConsultant.consultantRating || 'Henüz puanlanmamış');
    } else {
      console.log('- Atanan Danışman: YOK ❌');
    }

    console.log('\n✅ Test tamamlandı!');
    console.log(`🌐 Başvuru detayını görmek için: http://localhost:3001/applications/${newApplication.id}`);

  } catch (error) {
    console.error('❌ Test sırasında hata oluştu:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Test'i çalıştır
testNewApplication().then(() => {
  console.log('\n🏁 Test scripti tamamlandı');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test scripti hatası:', error);
  process.exit(1);
});