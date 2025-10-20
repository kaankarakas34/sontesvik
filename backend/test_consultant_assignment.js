const { Application, User } = require('./src/models');
const ConsultantAssignmentService = require('./src/services/consultantAssignmentService');
const { sequelize } = require('./src/config/database');

async function testAndFixConsultantAssignment() {
  try {
    await sequelize.authenticate();
    console.log('=== DANIŞMAN ATAMA TESTİ VE DÜZELTMESİ ===');
    
    // Danışmanı olmayan başvuruları bul
    const applicationsWithoutConsultant = await Application.findAll({
      where: {
        assignedConsultantId: null
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'sectorId']
      }],
      limit: 5
    });
    
    console.log(`Danışmanı olmayan başvuru sayısı: ${applicationsWithoutConsultant.length}`);
    
    for (const application of applicationsWithoutConsultant) {
      console.log(`\n--- Başvuru: ${application.id} ---`);
      console.log(`Kullanıcı: ${application.user.firstName} ${application.user.lastName}`);
      console.log(`Kullanıcı Sektör ID: ${application.user.sectorId}`);
      
      if (application.user.sectorId) {
        console.log('Danışman ataması deneniyor...');
        
        const assignmentResult = await ConsultantAssignmentService.autoAssignConsultant(
          application.id,
          application.user.sectorId
        );
        
        if (assignmentResult.success) {
          console.log(`✅ Danışman atandı: ${assignmentResult.consultantName}`);
        } else {
          console.log(`❌ Danışman atanamadı: ${assignmentResult.message}`);
          
          // Detaylı hata analizi
          console.log('Uygun danışmanları kontrol ediliyor...');
          const availableConsultants = await ConsultantAssignmentService.findAvailableConsultants(application.user.sectorId);
          console.log(`Uygun danışman sayısı: ${availableConsultants.length}`);
          
          if (availableConsultants.length > 0) {
            console.log('Uygun danışmanlar:');
            availableConsultants.forEach((consultant, index) => {
              console.log(`  ${index + 1}. ${consultant.firstName} ${consultant.lastName} (${consultant.email})`);
            });
          }
        }
      } else {
        console.log('❌ Kullanıcının sektör bilgisi yok!');
      }
    }
    
    // Son durumu kontrol et
    console.log('\n=== SON DURUM ===');
    const updatedApplications = await Application.findAll({
      include: [{
        model: User,
        as: 'assignedConsultant',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    updatedApplications.forEach((app, index) => {
      console.log(`${index + 1}. ${app.id} - ${app.assignedConsultant ? 
        `${app.assignedConsultant.firstName} ${app.assignedConsultant.lastName}` : 
        'DANIŞMAN YOK'}`);
    });
    
  } catch (error) {
    console.error('Hata:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

testAndFixConsultantAssignment();