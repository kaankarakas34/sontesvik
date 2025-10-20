const { Application, User } = require('./src/models');
const { sequelize } = require('./src/config/database');

async function checkApplications() {
  try {
    await sequelize.authenticate();
    console.log('=== MEVCUT BAŞVURULAR VE DANIŞMAN ATAMALARI ===');
    
    const applications = await Application.findAll({
      include: [{
        model: User,
        as: 'assignedConsultant',
        attributes: ['id', 'firstName', 'lastName', 'email', 'consultantRating']
      }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    console.log(`Toplam başvuru sayısı: ${applications.length}`);
    
    applications.forEach((app, index) => {
      console.log(`\n--- Başvuru ${index + 1} ---`);
      console.log(`ID: ${app.id}`);
      console.log(`Proje Başlığı: ${app.projectTitle}`);
      console.log(`Durum: ${app.status}`);
      console.log(`Atanan Danışman ID: ${app.assignedConsultantId}`);
      
      if (app.assignedConsultant) {
        console.log(`Danışman: ${app.assignedConsultant.firstName} ${app.assignedConsultant.lastName}`);
        console.log(`Email: ${app.assignedConsultant.email}`);
        console.log(`Rating: ${app.assignedConsultant.consultantRating}`);
      } else {
        console.log('Danışman: ATANMAMIŞ');
      }
    });
    
  } catch (error) {
    console.error('Hata:', error.message);
  } finally {
    process.exit(0);
  }
}

checkApplications();