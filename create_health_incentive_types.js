const { IncentiveType, Sector } = require('./backend/src/models');

const healthIncentiveTypes = [
  {
    name: 'Reklam, Tanıtım ve Pazarlama Desteği',
    description: 'Sağlık sektöründe reklam, tanıtım ve pazarlama faaliyetleri için destek. Harcama kalemleri içinde değişen üst limitler ve ön onay alınarak desteklenen harcamalar bulunmaktadır.',
    color: '#10B981',
    icon: 'megaphone'
  },
  {
    name: 'Hasta Yol Desteği',
    description: 'Muayenehane ve polikliniklerde hasta yol masrafları için destek. Hasta başına destek üst limiti 54.000 TL.',
    color: '#3B82F6',
    icon: 'user-group'
  },
  {
    name: 'İstihdam Desteği',
    description: 'Sağlık sektöründe ön onay alınan personel için istihdam desteği. Personel başına aylık destek üst limiti 49.000 TL.',
    color: '#8B5CF6',
    icon: 'users'
  },
  {
    name: 'Acente Komisyon Desteği',
    description: 'Bakanlıkça izin verilen acentelere ödenen komisyonlar için destek.',
    color: '#F59E0B',
    icon: 'building-office'
  },
  {
    name: 'Yurt Dışı Ofis Kira Desteği',
    description: 'Yurt dışında açılan ofislerin kira bedeli ve zorunlu giderleri için destek. Personel harcamaları desteklenmez.',
    color: '#EF4444',
    icon: 'globe-alt'
  },
  {
    name: 'Komplikasyon ve Seyahat Sağlık Sigortası Desteği',
    description: 'Sağlık turizmi kapsamında komplikasyon ve seyahat sağlık sigortası için destek. 2026 itibarıyla cerrahi işlemlerde zorunludur.',
    color: '#06B6D4',
    icon: 'shield-check'
  },
  {
    name: 'Yurt Dışı ve İçi Fuar, Konferans vb. Etkinlik Katılım Desteği',
    description: 'Bakanlıkça belirlenen fuar ve etkinliklere katılımlar için destek.',
    color: '#84CC16',
    icon: 'presentation-chart-line'
  },
  {
    name: 'Pazara Giriş Belgeleri (Akreditasyon ve Belgelendirme) Desteği',
    description: 'Akreditasyon ve belgelendirme süreçleri için destek. Belge başına üst sınır 2.735.000 TL. İklimle ilgili belgelerde destek oranı %70.',
    color: '#F97316',
    icon: 'document-check'
  },
  {
    name: 'Yabancı Dil ve Sağlık Turizmi Eğitimi Desteği',
    description: 'Sağlık personeli için yabancı dil ve sağlık turizmi eğitimi desteği. Muayenehane ve polikliniklerde yıllık üst limit 1.090.000 TL.',
    color: '#EC4899',
    icon: 'academic-cap'
  },
  {
    name: 'Yurt Dışı Marka Tescil ve Koruma Desteği',
    description: 'Yurt dışında marka tescil ve koruma işlemleri için destek. Hedef ülkelerde destek oranı %70.',
    color: '#6366F1',
    icon: 'shield-exclamation'
  },
  {
    name: 'Yurt İçi Tanıtım ve Eğitim Programı Desteği',
    description: 'Yurt içinde düzenlenen tanıtım ve eğitim programları için destek. Yıllık 5 etkinlikle sınırlıdır. Faaliyetten en az 1 ay önce ön onay alınmalıdır.',
    color: '#14B8A6',
    icon: 'presentation-chart-bar'
  },
  {
    name: 'Ürün Yerleştirme Desteği',
    description: 'Sağlık sektöründe ürün yerleştirme faaliyetleri için destek. Faaliyetten en az 1 ay önce ön onay alınmalıdır.',
    color: '#A855F7',
    icon: 'cube'
  }
];

async function createHealthIncentiveTypes() {
  try {
    console.log('🏥 Sağlık sektörü teşvik türleri oluşturuluyor...');
    
    // Sağlık sektörünü bul
    const healthSector = await Sector.findOne({ where: { code: 'HEALTH' } });
    
    if (!healthSector) {
      console.log('❌ Sağlık sektörü bulunamadı!');
      return;
    }

    console.log(`✅ Sağlık sektörü bulundu: ${healthSector.name} (${healthSector.id})`);

    let createdCount = 0;
    let skippedCount = 0;

    // Her bir teşvik türü için
    for (const typeData of healthIncentiveTypes) {
      // Aynı isimde teşvik türü var mı kontrol et
      const existingType = await IncentiveType.findOne({
        where: { 
          name: typeData.name,
          sectorId: healthSector.id 
        }
      });

      if (existingType) {
        console.log(`⏭️  ${typeData.name} zaten var, atlanıyor...`);
        skippedCount++;
        continue;
      }

      // Yeni teşvik türü oluştur
      const newType = await IncentiveType.create({
        name: typeData.name,
        description: typeData.description,
        color: typeData.color,
        icon: typeData.icon,
        sectorId: healthSector.id,
        isActive: true
      });

      console.log(`✅ ${newType.name} teşvik türü oluşturuldu`);
      createdCount++;
    }

    console.log('\n🎉 Sağlık sektörü teşvik türleri işlemi tamamlandı!');
    console.log(`📊 Oluşturulan: ${createdCount}, Atlanan: ${skippedCount}`);
    
    // Son durumu göster
    const totalHealthTypes = await IncentiveType.count({
      where: { sectorId: healthSector.id, isActive: true }
    });
    
    console.log(`📋 Sağlık sektöründe toplam aktif teşvik türü sayısı: ${totalHealthTypes}`);

  } catch (error) {
    console.error('❌ Hata oluştu:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

// Fonksiyonu çalıştır
createHealthIncentiveTypes();