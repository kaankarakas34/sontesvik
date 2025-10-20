const { Application, User, Sector } = require('./src/models');

async function checkApplications() {
  try {
    console.log('=== BAŞVURU VE DANIŞMAN ATAMA KONTROLÜ ===\n');
    
    const applications = await Application.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'sectorId'],
          include: [{
            model: Sector,
            as: 'sector',
            attributes: ['id', 'name', 'code']
          }]
        },
        {
          model: User,
          as: 'assignedConsultant',
          attributes: ['id', 'firstName', 'lastName', 'email', 'sectorId'],
          include: [{
            model: Sector,
            as: 'sector',
            attributes: ['id', 'name', 'code']
          }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    console.log(`📋 Toplam ${applications.length} başvuru bulundu\n`);
    
    let assignedCount = 0;
    let unassignedCount = 0;
    
    applications.forEach((app, index) => {
      console.log(`${index + 1}. BAŞVURU (ID: ${app.id})`);
      console.log(`   📅 Oluşturulma: ${app.createdAt.toLocaleString('tr-TR')}`);
      console.log(`   👤 Başvuran: ${app.user.firstName} ${app.user.lastName} (${app.user.email})`);
      console.log(`   🏢 Başvuran Sektörü: ${app.user.sector ? app.user.sector.name : 'Belirtilmemiş'}`);
      
      if (app.assignedConsultant) {
        console.log(`   ✅ Atanan Danışman: ${app.assignedConsultant.firstName} ${app.assignedConsultant.lastName}`);
        console.log(`   🎯 Danışman Sektörü: ${app.assignedConsultant.sector ? app.assignedConsultant.sector.name : 'Belirtilmemiş'}`);
        console.log(`   📧 Danışman Email: ${app.assignedConsultant.email}`);
        assignedCount++;
      } else {
        console.log(`   ❌ Danışman Atanmamış`);
        unassignedCount++;
      }
      console.log(`   📊 Durum: ${app.status}`);
      console.log('   ' + '-'.repeat(50));
    });
    
    console.log(`\n=== ÖZET ===`);
    console.log(`✅ Danışman atanmış: ${assignedCount}`);
    console.log(`❌ Danışman atanmamış: ${unassignedCount}`);
    console.log(`📊 Atama oranı: ${applications.length > 0 ? ((assignedCount / applications.length) * 100).toFixed(1) : 0}%`);
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    process.exit(0);
  }
}

checkApplications();