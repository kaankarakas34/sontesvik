const { User, Sector } = require('./src/models');
const bcrypt = require('bcryptjs');

// Her sektör için danışman isimleri
const consultantNames = {
  'HEALTH': [
    { firstName: 'Dr. Ayşe', lastName: 'Sağlık', email: 'ayse.saglik@tesvik360.com' },
    { firstName: 'Dr. Mehmet', lastName: 'Doktor', email: 'mehmet.doktor@tesvik360.com' },
    { firstName: 'Uzm. Fatma', lastName: 'Hemşire', email: 'fatma.hemsire@tesvik360.com' }
  ],
  'TECH': [
    { firstName: 'Ahmet', lastName: 'Yazılımcı', email: 'ahmet.yazilimci@tesvik360.com' },
    { firstName: 'Zeynep', lastName: 'Teknoloji', email: 'zeynep.teknoloji@tesvik360.com' },
    { firstName: 'Murat', lastName: 'Geliştirici', email: 'murat.gelistirici@tesvik360.com' }
  ],
  'EDUCATION': [
    { firstName: 'Prof. Elif', lastName: 'Öğretmen', email: 'elif.ogretmen@tesvik360.com' },
    { firstName: 'Doç. Ali', lastName: 'Akademisyen', email: 'ali.akademisyen@tesvik360.com' },
    { firstName: 'Öğr. Gör. Selin', lastName: 'Eğitimci', email: 'selin.egitimci@tesvik360.com' }
  ],
  'MANUFACTURING': [
    { firstName: 'Mühendis Kemal', lastName: 'Üretici', email: 'kemal.uretici@tesvik360.com' },
    { firstName: 'Teknik Ayhan', lastName: 'İmalat', email: 'ayhan.imalat@tesvik360.com' },
    { firstName: 'Uzman Gülsüm', lastName: 'Fabrika', email: 'gulsum.fabrika@tesvik360.com' }
  ],
  'AGRICULTURE': [
    { firstName: 'Ziraat Murat', lastName: 'Çiftçi', email: 'murat.ciftci@tesvik360.com' },
    { firstName: 'Veteriner Ayşe', lastName: 'Hayvancı', email: 'ayse.hayvanci@tesvik360.com' },
    { firstName: 'Tarım Uzmanı Hasan', lastName: 'Tarımcı', email: 'hasan.tarimci@tesvik360.com' }
  ],
  'ENERGY': [
    { firstName: 'Enerji Uzmanı Deniz', lastName: 'Elektrik', email: 'deniz.elektrik@tesvik360.com' },
    { firstName: 'Mühendis Canan', lastName: 'Güneş', email: 'canan.gunes@tesvik360.com' },
    { firstName: 'Teknisyen Oğuz', lastName: 'Rüzgar', email: 'oguz.ruzgar@tesvik360.com' }
  ],
  'TEST': [
    { firstName: 'Test Danışman', lastName: 'Bir', email: 'test.danisman1@tesvik360.com' },
    { firstName: 'Test Danışman', lastName: 'İki', email: 'test.danisman2@tesvik360.com' },
    { firstName: 'Test Danışman', lastName: 'Üç', email: 'test.danisman3@tesvik360.com' }
  ]
};

async function createConsultantsBySector() {
  try {
    console.log('🚀 Her sektör için 3 danışman oluşturuluyor...');
    console.log('=' .repeat(60));

    // Tüm sektörleri getir
    const sectors = await Sector.findAll({
      where: { isActive: true }
    });

    console.log(`📋 ${sectors.length} aktif sektör bulundu`);

    let totalCreated = 0;
    let totalSkipped = 0;

    for (const sector of sectors) {
      console.log(`\n🏢 ${sector.name} (${sector.code}) sektörü için danışmanlar oluşturuluyor...`);
      
      const sectorConsultants = consultantNames[sector.code] || [];
      
      if (sectorConsultants.length === 0) {
        console.log(`⚠️  ${sector.code} sektörü için tanımlı danışman bulunamadı, atlanıyor...`);
        continue;
      }

      for (let i = 0; i < sectorConsultants.length; i++) {
        const consultantData = sectorConsultants[i];
        
        // Email kontrolü - zaten var mı?
        const existingUser = await User.findOne({
          where: { email: consultantData.email }
        });

        if (existingUser) {
          console.log(`   ⏭️  ${consultantData.email} zaten mevcut, atlanıyor...`);
          totalSkipped++;
          continue;
        }

        // Şifreyi hash'le
        const hashedPassword = await bcrypt.hash('admin123', 12);

        // Danışman oluştur
        const consultant = await User.create({
          firstName: consultantData.firstName,
          lastName: consultantData.lastName,
          email: consultantData.email,
          password: hashedPassword,
          phone: `+90 555 ${(Math.floor(Math.random() * 900) + 100).toString()} ${(i+1).toString().padStart(2, '0')} ${(Math.floor(Math.random() * 90) + 10).toString()}`,
          role: 'consultant',
          sectorId: sector.id,
          isApproved: true,
          isActive: true,
          emailVerified: true,
          consultantStatus: 'active',
          consultantRating: (4.0 + Math.random()).toFixed(1), // 4.0-5.0 arası rating
          consultantReviewCount: Math.floor(Math.random() * 50) + 10, // 10-60 arası review sayısı
          consultantBio: `${sector.name} sektöründe uzman danışman. Teşvik süreçlerinde deneyimli.`,
          consultantSpecializations: [sector.name, 'Teşvik Danışmanlığı', 'Proje Yönetimi'],
          maxConcurrentApplications: 15
        });

        console.log(`   ✅ ${consultant.firstName} ${consultant.lastName} oluşturuldu (${consultant.email})`);
        totalCreated++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`🎉 İşlem tamamlandı!`);
    console.log(`✅ Toplam ${totalCreated} danışman oluşturuldu`);
    console.log(`⏭️  Toplam ${totalSkipped} danışman zaten mevcuttu`);
    console.log(`📊 Her sektör için 3 danışman hedeflendi`);

    // Sektör bazında özet
    console.log('\n📈 Sektör Bazında Özet:');
    for (const sector of sectors) {
      const consultantCount = await User.count({
        where: {
          role: 'consultant',
          sectorId: sector.id,
          isActive: true
        }
      });
      console.log(`   ${sector.name}: ${consultantCount} danışman`);
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    process.exit(0);
  }
}

// Script'i çalıştır
createConsultantsBySector();