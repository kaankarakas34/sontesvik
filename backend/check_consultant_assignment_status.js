const { Application, User, Sector } = require('./src/models');
const { sequelize } = require('./src/config/database');

async function checkConsultantAssignmentStatus() {
  try {
    await sequelize.authenticate();
    console.log('=== DANIŞMAN ATAMA DURUMU KONTROLÜ ===\n');
    
    // Genel istatistikler
    const totalApplications = await Application.count();
    const applicationsWithConsultant = await Application.count({
      where: {
        assignedConsultantId: { [require('sequelize').Op.not]: null }
      }
    });
    const applicationsWithoutConsultant = totalApplications - applicationsWithConsultant;
    
    console.log('📊 GENEL İSTATİSTİKLER:');
    console.log(`Toplam başvuru sayısı: ${totalApplications}`);
    console.log(`Danışmanı olan başvuru: ${applicationsWithConsultant}`);
    console.log(`Danışmanı olmayan başvuru: ${applicationsWithoutConsultant}`);
    console.log(`Başarı oranı: ${((applicationsWithConsultant / totalApplications) * 100).toFixed(1)}%\n`);
    
    // Son 10 başvurunun detayları
    console.log('📋 SON 10 BAŞVURUNUN DURUMU:');
    const recentApplications = await Application.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
          include: [{
            model: Sector,
            as: 'sector',
            attributes: ['name']
          }]
        },
        {
          model: User,
          as: 'assignedConsultant',
          attributes: ['id', 'firstName', 'lastName', 'email', 'consultantRating'],
          required: false
        }
      ]
    });
    
    recentApplications.forEach((app, index) => {
      console.log(`\n${index + 1}. Başvuru ID: ${app.id}`);
      console.log(`   Proje: ${app.projectTitle || 'Belirtilmemiş'}`);
      console.log(`   Başvuru Sahibi: ${app.user.firstName} ${app.user.lastName} (${app.user.email})`);
      console.log(`   Sektör: ${app.user.sector ? app.user.sector.name : 'Belirtilmemiş'}`);
      console.log(`   Durum: ${app.status}`);
      
      if (app.assignedConsultant) {
        console.log(`   ✅ Atanan Danışman: ${app.assignedConsultant.firstName} ${app.assignedConsultant.lastName}`);
        console.log(`   📧 Danışman Email: ${app.assignedConsultant.email}`);
        console.log(`   ⭐ Derecelendirme: ${app.assignedConsultant.consultantRating || 'Belirtilmemiş'}`);
        console.log(`   📅 Atama Tarihi: ${app.consultantAssignedAt ? new Date(app.consultantAssignedAt).toLocaleString('tr-TR') : 'Belirtilmemiş'}`);
      } else {
        console.log(`   ❌ Danışman: ATANMAMIŞ`);
      }
    });
    
    // Danışman bazında iş yükü
    console.log('\n\n👥 DANIŞMAN İŞ YÜKÜ DAĞILIMI:');
    const consultantWorkload = await sequelize.query(`
      SELECT 
        u.id,
        u.first_name || ' ' || u.last_name as consultant_name,
        u.email,
        u.consultant_rating,
        s.name as sector_name,
        COUNT(a.id) as active_applications,
        u.max_concurrent_applications
      FROM users u
      LEFT JOIN "Applications" a ON u.id = a.assigned_consultant_id AND a.deleted_at IS NULL
      LEFT JOIN "Sectors" s ON u.sector_id = s.id
      WHERE u.role = 'consultant' AND u.is_active = true
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.consultant_rating, s.name, u.max_concurrent_applications
      ORDER BY active_applications DESC
    `, { type: sequelize.QueryTypes.SELECT });
    
    consultantWorkload.forEach((consultant, index) => {
      const workloadPercentage = ((consultant.active_applications / consultant.max_concurrent_applications) * 100).toFixed(1);
      console.log(`\n${index + 1}. ${consultant.consultant_name}`);
      console.log(`   📧 Email: ${consultant.email}`);
      console.log(`   🏢 Sektör: ${consultant.sector_name}`);
      console.log(`   ⭐ Derecelendirme: ${consultant.consultant_rating || 'Belirtilmemiş'}`);
      console.log(`   📊 Aktif Başvuru: ${consultant.active_applications}/${consultant.max_concurrent_applications} (%${workloadPercentage})`);
      
      if (consultant.active_applications >= consultant.max_concurrent_applications) {
        console.log(`   🔴 KAPASITE DOLU`);
      } else {
        console.log(`   🟢 Müsait (${consultant.max_concurrent_applications - consultant.active_applications} slot)`);
      }
    });
    
    // Sektör bazında dağılım
    console.log('\n\n🏢 SEKTÖR BAZINDA BAŞVURU DAĞILIMI:');
    const sectorDistribution = await sequelize.query(`
      SELECT 
        s.name as sector_name,
        COUNT(DISTINCT a.id) as total_applications,
        COUNT(DISTINCT CASE WHEN a.assigned_consultant_id IS NOT NULL THEN a.id END) as assigned_applications,
        COUNT(DISTINCT u.id) as available_consultants
      FROM "Sectors" s
      LEFT JOIN users u ON s.id = u.sector_id AND u.role = 'consultant' AND u.is_active = true
      LEFT JOIN users app_users ON s.id = app_users.sector_id AND app_users.role IN ('user', 'member')
      LEFT JOIN "Applications" a ON app_users.id = a.user_id AND a.deleted_at IS NULL
      WHERE s.is_active = true
      GROUP BY s.id, s.name
      ORDER BY total_applications DESC
    `, { type: sequelize.QueryTypes.SELECT });
    
    sectorDistribution.forEach((sector, index) => {
      const assignmentRate = sector.total_applications > 0 ? 
        ((sector.assigned_applications / sector.total_applications) * 100).toFixed(1) : '0.0';
      
      console.log(`\n${index + 1}. ${sector.sector_name}`);
      console.log(`   📋 Toplam Başvuru: ${sector.total_applications}`);
      console.log(`   ✅ Atanan: ${sector.assigned_applications}`);
      console.log(`   👥 Mevcut Danışman: ${sector.available_consultants}`);
      console.log(`   📊 Atama Oranı: %${assignmentRate}`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

checkConsultantAssignmentStatus();