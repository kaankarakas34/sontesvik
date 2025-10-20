const { Application } = require('./backend/src/models');

async function checkApplications() {
  try {
    const applications = await Application.findAll({
      attributes: ['id', 'userId', 'status', 'createdAt']
    });
    
    console.log('Mevcut başvurular:');
    applications.forEach(app => {
      console.log(`ID: ${app.id}, UserID: ${app.userId}, Status: ${app.status}, Created: ${app.createdAt}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error.message);
    process.exit(1);
  }
}

checkApplications();