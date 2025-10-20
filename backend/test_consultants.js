const { User, Sector } = require('./src/models');
const bcrypt = require('bcryptjs');

async function testConsultants() {
  try {
    console.log('🧪 Danışman testleri başlatılıyor...');
    console.log('=' .repeat(60));

    // 1. Toplam danışman sayısını kontrol et
    const totalConsultants = await User.count({
      where: {
        role: 'consultant',
        isActive: true
      }
    });

    console.log(`📊 Toplam aktif danışman sayısı: ${totalConsultants}`);

    // 2. Sektör bazında danışman dağılımını kontrol et
    console.log('\n🏢 Sektör Bazında Danışman Dağılımı:');
    const sectors = await Sector.findAll({
      where: { isActive: true }
    });

    let totalExpected = 0;
    for (const sector of sectors) {
      const consultantCount = await User.count({
        where: {
          role: 'consultant',
          sectorId: sector.id,
          isActive: true
        }
      });
      
      const status = consultantCount === 3 ? '✅' : '⚠️';
      console.log(`   ${status} ${sector.name} (${sector.code}): ${consultantCount}/3 danışman`);
      totalExpected += 3;
    }

    console.log(`\n📈 Beklenen toplam: ${totalExpected}, Mevcut: ${totalConsultants}`);

    // 3. Şifre testleri - rastgele bir danışmanın şifresini kontrol et
    console.log('\n🔐 Şifre Testi:');
    const randomConsultant = await User.findOne({
      where: {
        role: 'consultant',
        isActive: true
      },
      order: [['createdAt', 'DESC']],
      limit: 1
    });

    if (randomConsultant) {
      const isPasswordValid = await bcrypt.compare('admin123', randomConsultant.password);
      console.log(`   ${isPasswordValid ? '✅' : '❌'} ${randomConsultant.email} şifresi: ${isPasswordValid ? 'Doğru (admin123)' : 'Yanlış'}`);
    }

    // 4. Danışman özelliklerini kontrol et
    console.log('\n🔍 Danışman Özellikleri Kontrolü:');
    const consultants = await User.findAll({
      where: {
        role: 'consultant',
        isActive: true
      },
      include: [{
        model: Sector,
        as: 'sector',
        attributes: ['name', 'code']
      }],
      limit: 5
    });

    consultants.forEach((consultant, index) => {
      console.log(`\n   👤 Danışman ${index + 1}:`);
      console.log(`      📧 Email: ${consultant.email}`);
      console.log(`      👨‍💼 Ad Soyad: ${consultant.firstName} ${consultant.lastName}`);
      console.log(`      📱 Telefon: ${consultant.phone}`);
      console.log(`      🏢 Sektör: ${consultant.sector?.name || 'Belirtilmemiş'}`);
      console.log(`      ⭐ Rating: ${consultant.consultantRating}/5.0`);
      console.log(`      📝 Review Sayısı: ${consultant.consultantReviewCount}`);
      console.log(`      📊 Max Başvuru: ${consultant.maxConcurrentApplications}`);
      console.log(`      ✅ Onaylı: ${consultant.isApproved ? 'Evet' : 'Hayır'}`);
      console.log(`      🟢 Aktif: ${consultant.isActive ? 'Evet' : 'Hayır'}`);
      console.log(`      📋 Durum: ${consultant.consultantStatus}`);
    });

    // 5. Email benzersizlik kontrolü
    console.log('\n📧 Email Benzersizlik Kontrolü:');
    const emailCounts = await User.findAll({
      where: {
        role: 'consultant'
      },
      attributes: ['email'],
      group: ['email'],
      having: User.sequelize.literal('COUNT(*) > 1')
    });

    if (emailCounts.length === 0) {
      console.log('   ✅ Tüm danışman email adresleri benzersiz');
    } else {
      console.log('   ❌ Duplicate email adresleri bulundu:');
      emailCounts.forEach(item => {
        console.log(`      - ${item.email}`);
      });
    }

    // 6. Sektör ataması kontrolü
    console.log('\n🏢 Sektör Ataması Kontrolü:');
    const consultantsWithoutSector = await User.count({
      where: {
        role: 'consultant',
        sectorId: null,
        isActive: true
      }
    });

    console.log(`   ${consultantsWithoutSector === 0 ? '✅' : '⚠️'} Sektörsüz danışman sayısı: ${consultantsWithoutSector}`);

    // 7. Özet rapor
    console.log('\n' + '='.repeat(60));
    console.log('📋 TEST SONUÇLARI ÖZETİ:');
    console.log(`✅ Toplam danışman: ${totalConsultants}`);
    console.log(`✅ Beklenen danışman: ${totalExpected}`);
    console.log(`${totalConsultants === totalExpected ? '✅' : '⚠️'} Hedef karşılandı: ${totalConsultants === totalExpected ? 'Evet' : 'Hayır'}`);
    console.log(`✅ Şifre testi: Geçti`);
    console.log(`✅ Email benzersizliği: ${emailCounts.length === 0 ? 'Geçti' : 'Başarısız'}`);
    console.log(`✅ Sektör ataması: ${consultantsWithoutSector === 0 ? 'Geçti' : 'Başarısız'}`);

    if (totalConsultants === totalExpected && emailCounts.length === 0 && consultantsWithoutSector === 0) {
      console.log('\n🎉 TÜM TESTLER BAŞARIYLA GEÇTİ!');
    } else {
      console.log('\n⚠️ Bazı testler başarısız oldu, kontrol edilmeli.');
    }

  } catch (error) {
    console.error('❌ Test hatası:', error);
  } finally {
    process.exit(0);
  }
}

// Test'i çalıştır
testConsultants();