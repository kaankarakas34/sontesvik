const { Incentive, IncentiveType, Sector } = require('./backend/src/models');

const healthIncentivesData = [
  {
    typeName: 'Reklam, Tanıtım ve Pazarlama Desteği',
    title: 'Sağlık Turizmi Reklam ve Tanıtım Desteği',
    description: 'Sağlık sektöründe reklam, tanıtım ve pazarlama faaliyetleri için destek. Harcama kalemleri içinde değişen üst limitler ve ön onay alınarak desteklenen harcamalar bulunmaktadır. Özel tanıtım faaliyetlerine ön onay alınmalıdır. Destek oranına, %10 hedef ülke ve %10 platform üyeliği dahildir.',
    maxAmount: 27357000,
    supportRate: 80,
    provider: 'Sağlık Bakanlığı',
    eligibilityCriteria: 'Sağlık turizmi sertifikası olan kuruluşlar başvurabilir. Özel tanıtım faaliyetlerine ön onay alınmalıdır.',
    tags: ['sağlık turizmi', 'reklam', 'tanıtım', 'pazarlama']
  },
  {
    typeName: 'Hasta Yol Desteği',
    title: 'Hasta Yol Masrafları Desteği',
    description: 'Muayenehane ve polikliniklerde hasta yol masrafları için destek. Muayenehane ve polikliniklerde yıllık üst limit 2.735.000 TL. Hasta başına destek üst limiti 54.000 TL.',
    maxAmount: 27357000,
    supportRate: 60,
    provider: 'Sağlık Bakanlığı',
    eligibilityCriteria: 'Sağlık turizmi yetki belgesi olan sağlık kuruluşları. Hasta başına yıllık üst limit 54.000 TL.',
    tags: ['hasta yol', 'ulaşım', 'sağlık turizmi']
  },
  {
    typeName: 'İstihdam Desteği',
    title: 'Sağlık Personeli İstihdam Desteği',
    description: 'Sağlık sektöründe ön onay alınan personel için istihdam desteği. Muayenehane ve polikliniklerde yıllık üst limit 2.735.000 TL. Personel başına aylık destek üst limiti 49.000 TL.',
    maxAmount: 10942000,
    supportRate: 60,
    provider: 'İŞKUR',
    eligibilityCriteria: 'Ön onay alınan sağlık personeli için geçerlidir. Personel başına aylık üst limit 49.000 TL.',
    tags: ['istihdam', 'personel', 'sağlık çalışanı']
  },
  {
    typeName: 'Acente Komisyon Desteği',
    title: 'Sağlık Turizmi Acente Komisyon Desteği',
    description: 'Bakanlıkça izin verilen acentelere ödenen komisyonlar için destek.',
    maxAmount: 5470000,
    supportRate: 60,
    provider: 'Sağlık Bakanlığı',
    eligibilityCriteria: 'Bakanlıkça izin verilen sağlık turizmi acenteleri.',
    tags: ['acente', 'komisyon', 'sağlık turizmi']
  },
  {
    typeName: 'Yurt Dışı Ofis Kira Desteği',
    title: 'Yurt Dışı Temsilcilik Ofis Kira Desteği',
    description: 'Yurt dışında açılan ofislerin kira bedeli ve zorunlu giderleri için destek. Birim açılışına dair zorunlu giderler ve kira bedeli desteklenir, personel harcamaları desteklenmez.',
    maxAmount: 6564000,
    supportRate: 60,
    provider: 'Ticaret Bakanlığı',
    eligibilityCriteria: 'Yurt dışında ofis açan sağlık kuruluşları. Personel harcamaları desteklenmez.',
    tags: ['yurt dışı', 'ofis', 'kira', 'temsilcilik']
  },
  {
    typeName: 'Komplikasyon ve Seyahat Sağlık Sigortası Desteği',
    title: 'Sağlık Turizmi Sigorta Desteği',
    description: 'Sağlık turizmi kapsamında komplikasyon ve seyahat sağlık sigortası için destek. 2026 itibarıyla cerrahi işlemlerde zorunludur.',
    maxAmount: 10942000,
    supportRate: 70,
    provider: 'Sağlık Bakanlığı',
    eligibilityCriteria: '2026 yılından itibaren cerrahi işlemlerde zorunlu olacaktır.',
    tags: ['sigorta', 'komplikasyon', 'seyahat', 'sağlık turizmi']
  },
  {
    typeName: 'Yurt Dışı ve İçi Fuar, Konferans vb. Etkinlik Katılım Desteği',
    title: 'Sağlık Fuarları ve Konferans Katılım Desteği',
    description: 'Bakanlıkça belirlenen fuar ve etkinliklere katılımlar için destek.',
    maxAmount: 1367000,
    supportRate: 60,
    provider: 'Ticaret Bakanlığı',
    eligibilityCriteria: 'Bakanlıkça belirlenen fuar ve etkinlik listesinde yer alan organizasyonlar.',
    tags: ['fuar', 'konferans', 'etkinlik', 'katılım']
  },
  {
    typeName: 'Pazara Giriş Belgeleri (Akreditasyon ve Belgelendirme) Desteği',
    title: 'Sağlık Akreditasyon ve Belgelendirme Desteği',
    description: 'Akreditasyon ve belgelendirme süreçleri için destek. Belge başına üst sınır 2.735.000 TL. İklimle ilgili belgelerde destek oranı %70 olarak uygulanır.',
    maxAmount: 8206000,
    supportRate: 60,
    provider: 'Sağlık Bakanlığı',
    eligibilityCriteria: 'Uluslararası akreditasyon belgesi almak isteyen sağlık kuruluşları.',
    tags: ['akreditasyon', 'belgelendirme', 'kalite', 'sertifika']
  },
  {
    typeName: 'Yabancı Dil ve Sağlık Turizmi Eğitimi Desteği',
    title: 'Sağlık Personeli Dil ve Turizm Eğitimi Desteği',
    description: 'Sağlık personeli için yabancı dil ve sağlık turizmi eğitimi desteği. Muayenehane ve polikliniklerde yıllık üst limit 1.090.000 TL.',
    maxAmount: 4375000,
    supportRate: 60,
    provider: 'Sağlık Bakanlığı',
    eligibilityCriteria: 'Sağlık turizmi belgesi olan kuruluşların personeli.',
    tags: ['eğitim', 'yabancı dil', 'sağlık turizmi', 'personel']
  },
  {
    typeName: 'Yurt Dışı Marka Tescil ve Koruma Desteği',
    title: 'Sağlık Markası Tescil ve Koruma Desteği',
    description: 'Yurt dışında marka tescil ve koruma işlemleri için destek. Hedef ülkelerde destek oranı %70 olarak uygulanır.',
    maxAmount: 2735000,
    supportRate: 60,
    provider: 'Türk Patent ve Marka Kurumu',
    eligibilityCriteria: 'Yurt dışında marka tescili yaptırmak isteyen sağlık kuruluşları.',
    tags: ['marka', 'tescil', 'patent', 'yurt dışı']
  },
  {
    typeName: 'Yurt İçi Tanıtım ve Eğitim Programı Desteği',
    title: 'Sağlık Sektörü Tanıtım ve Eğitim Programı Desteği',
    description: 'Yurt içinde düzenlenen tanıtım ve eğitim programları için destek. Yıllık 5 etkinlikle sınırlıdır. Faaliyetten en az 1 ay önce ön onay alınmalıdır.',
    maxAmount: 2735000,
    supportRate: 60,
    provider: 'Sağlık Bakanlığı',
    eligibilityCriteria: 'Yıllık maksimum 5 etkinlik. En az 1 ay önceden ön onay gereklidir.',
    tags: ['tanıtım', 'eğitim', 'program', 'yurt içi']
  },
  {
    typeName: 'Ürün Yerleştirme Desteği',
    title: 'Sağlık Ürünleri Yerleştirme Desteği',
    description: 'Sağlık sektöründe ürün yerleştirme faaliyetleri için destek. Faaliyetten en az 1 ay önce ön onay alınmalıdır.',
    maxAmount: 5470000,
    supportRate: 60,
    provider: 'Sağlık Bakanlığı',
    eligibilityCriteria: 'En az 1 ay önceden ön onay gereklidir.',
    tags: ['ürün yerleştirme', 'pazarlama', 'tanıtım']
  }
];

async function createHealthIncentives() {
  try {
    console.log('🏥 Sağlık sektörü teşvikleri oluşturuluyor...');
    
    // Sağlık sektörünü bul
    const healthSector = await Sector.findOne({ where: { code: 'HEALTH' } });
    
    if (!healthSector) {
      console.log('❌ Sağlık sektörü bulunamadı!');
      return;
    }

    console.log(`✅ Sağlık sektörü bulundu: ${healthSector.name} (${healthSector.id})`);

    let createdCount = 0;
    let skippedCount = 0;

    // Her bir teşvik için
    for (const incentiveData of healthIncentivesData) {
      // İlgili teşvik türünü bul
      const incentiveType = await IncentiveType.findOne({
        where: { 
          name: incentiveData.typeName,
          sectorId: healthSector.id 
        }
      });

      if (!incentiveType) {
        console.log(`❌ Teşvik türü bulunamadı: ${incentiveData.typeName}`);
        continue;
      }

      // Aynı başlıkta teşvik var mı kontrol et
      const existingIncentive = await Incentive.findOne({
        where: { 
          title: incentiveData.title,
          sectorId: healthSector.id 
        }
      });

      if (existingIncentive) {
        console.log(`⏭️  ${incentiveData.title} zaten var, atlanıyor...`);
        skippedCount++;
        continue;
      }

      // Yeni teşvik oluştur
      const newIncentive = await Incentive.create({
        title: incentiveData.title,
        description: incentiveData.description,
        maxAmount: incentiveData.maxAmount,
        minAmount: 0,
        currency: 'TRY',
        provider: incentiveData.provider,
        providerType: 'government',
        status: 'active',
        eligibilityCriteria: incentiveData.eligibilityCriteria,
        tags: incentiveData.tags,
        sectorId: healthSector.id,
        incentiveTypeId: incentiveType.id,
        // Başvuru tarihleri (1 yıl süreyle aktif)
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 yıl sonra
        applicationDeadline: new Date(Date.now() + 330 * 24 * 60 * 60 * 1000), // 11 ay sonra
        // Ek bilgiler
        region: 'Türkiye',
        country: 'Turkey'
      });

      console.log(`✅ ${newIncentive.title} teşviki oluşturuldu (${incentiveData.maxAmount.toLocaleString('tr-TR')} TL, %${incentiveData.supportRate})`);
      createdCount++;
    }

    console.log('\n🎉 Sağlık sektörü teşvikleri işlemi tamamlandı!');
    console.log(`📊 Oluşturulan: ${createdCount}, Atlanan: ${skippedCount}`);
    
    // Son durumu göster
    const totalHealthIncentives = await Incentive.count({
      where: { sectorId: healthSector.id, status: 'active' }
    });
    
    console.log(`📋 Sağlık sektöründe toplam aktif teşvik sayısı: ${totalHealthIncentives}`);

    // Toplam destek tutarını hesapla
    const totalSupportAmount = healthIncentivesData.reduce((total, incentive) => {
      return total + incentive.maxAmount;
    }, 0);
    
    console.log(`💰 Toplam destek tutarı: ${totalSupportAmount.toLocaleString('tr-TR')} TL`);

  } catch (error) {
    console.error('❌ Hata oluştu:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

// Fonksiyonu çalıştır
createHealthIncentives();