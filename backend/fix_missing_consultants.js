const { Application, User } = require('./src/models');
const ConsultantAssignmentService = require('./src/services/consultantAssignmentService');
const { sequelize } = require('./src/config/database');

async function fixMissingConsultants() {
  try {
    await sequelize.authenticate();
    console.log('=== DANIŞMANI OLMAYAN BAŞVURULARI DÜZELTİYORUZ ===');
    
    // Danışmanı olmayan tüm başvuruları bul
    const applicationsWithoutConsultant = await Application.findAll({
      where: {
        assignedConsultantId: null
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'sectorId']
      }]
    });
    
    console.log(`Toplam danışmanı olmayan başvuru: ${applicationsWithoutConsultant.length}`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const application of applicationsWithoutConsultant) {
      console.log(`\n🔄 İşleniyor: ${application.id}`);
      console.log(`Kullanıcı: ${application.user.firstName} ${application.user.lastName}`);
      console.log(`Sektör ID: ${application.user.sectorId}`);
      
      if (application.user.sectorId) {
        try {
          const assignmentResult = await ConsultantAssignmentService.autoAssignConsultant(
            application.id,
            application.user.sectorId
          );
          
          if (assignmentResult.success) {
            console.log(`✅ Danışman atandı: ${assignmentResult.consultantName}`);
            successCount++;
          } else {
            console.log(`❌ Danışman atanamadı: ${assignmentResult.message}`);
            failCount++;
          }
        } catch (error) {
          console.log(`❌ Hata: ${error.message}`);
          failCount++;
        }
      } else {
        console.log('❌ Kullanıcının sektör bilgisi yok!');
        failCount++;
      }
    }
    
    console.log('\n=== ÖZET ===');
    console.log(`✅ Başarılı atamalar: ${successCount}`);
    console.log(`❌ Başarısız atamalar: ${failCount}`);
    console.log(`📊 Toplam işlenen: ${successCount + failCount}`);
    
    // Son durumu kontrol et
    console.log('\n=== SON DURUM KONTROLÜ ===');
    const remainingWithoutConsultant = await Application.count({
      where: {
        assignedConsultantId: null
      }
    });
    
    const totalApplications = await Application.count();
    const withConsultant = totalApplications - remainingWithoutConsultant;
    
    console.log(`Toplam başvuru: ${totalApplications}`);
    console.log(`Danışmanı olan: ${withConsultant}`);
    console.log(`Danışmanı olmayan: ${remainingWithoutConsultant}`);
    console.log(`Başarı oranı: ${((withConsultant / totalApplications) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('Hata:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

fixMissingConsultants();