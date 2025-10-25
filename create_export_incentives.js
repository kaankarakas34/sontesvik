const { Incentive, IncentiveType, Sector } = require('./backend/src/models');

const exportIncentivesData = [
  {
    typeName: 'Yurt Dışı Birim Kira Desteği',
    title: 'Yurt Dışı Birim Kira Desteği',
    description: 'Hedef ve öncelikli ülkelerde destek oranı %70, hedef ülkelerde ve hedef sektörlerde destek oranı %75 olarak uygulanır. Destek süresi her ülke için 4 yıldır.',
    maxAmount: 7629156,
    supportRate: 75,
    provider: 'Ticaret Bakanlığı',
    eligibilityCriteria: 'Hedef ve öncelikli ülkelerde faaliyet gösteren firmalar. Destek süresi 4 yıl.',
    tags: ['yurt dışı', 'kira', 'ofis', 'ihracat']
  },
  {
    typeName: 'Yurt Dışı Fuar Desteği',
    title: 'Yurt Dışı Fuar Desteği',
    description: 'Bakanlık tarafından açıklanan fuarlara katılımlar, metrekareye göre desteklenir. Hedef ülkelerde %70, hedef ülkelerde düzenlenen fuarlara katılan hedef sektörler için %75 oranına kadar destek verilir. Sektörel fuarlarda üst limit 952.853 TL, prestijli fuarlarda ise 2.860.670 TL\'dir.',
    maxAmount: 571290,
    supportRate: 75,
    provider: 'Ticaret Bakanlığı',
    eligibilityCriteria: 'Bakanlık tarafından açıklanan fuarlara katılım. Prestijli fuarlarda farklı limitler.',
    tags: ['fuar', 'yurt dışı', 'tanıtım', 'ihracat']
  },
  {
    typeName: 'Yurt Dışı Tanıtım Desteği',
    title: 'Yurt Dışı Tanıtım Desteği',
    description: 'Hedef ve öncelikli ülkelerde destek oranı %70, hedef ülkelerde ve hedef sektörlerde destek oranı %75 olarak uygulanır. Yıllık destek üst limiti, yurt dışı birimi olan şirketler için 9.536.972 TL\'dir. Destek süresi 4 yıldır.',
    maxAmount: 15260421,
    supportRate: 75,
    provider: 'Ticaret Bakanlığı',
    eligibilityCriteria: 'Yurt dışı birimi olan şirketler. Hedef ve öncelikli ülkelerde faaliyet.',
    tags: ['tanıtım', 'yurt dışı', 'pazarlama', 'ihracat']
  },
  {
    typeName: 'Yurt Dışı Marka Tescil Desteği',
    title: 'Yurt Dışı Marka Tescil Desteği',
    description: 'Hedef ve öncelikli ülkelerde destek oranı %70, hedef ülkelerde ve hedef sektörlerde %75 olarak uygulanır. Destek süresi 4 yıldır.',
    maxAmount: 2860670,
    supportRate: 75,
    provider: 'Ticaret Bakanlığı',
    eligibilityCriteria: 'Hedef ve öncelikli ülkelerde marka tescili yapacak firmalar.',
    tags: ['marka', 'tescil', 'yurt dışı', 'ihracat']
  },
  {
    typeName: 'Pazara Giriş Belgesi ve Ruhsatlandırma Desteği',
    title: 'Pazara Giriş Belgesi ile Ruhsatlandırma ve Kayıt Giderleri Desteği',
    description: 'İhracat için gerekli ve zorunlu olan, Bakanlık tarafından belirlenmiş belgelere yönelik harcamalar desteklenir.',
    maxAmount: 15260421,
    supportRate: 70,
    provider: 'Ticaret Bakanlığı',
    eligibilityCriteria: 'İhracat için gerekli belgelendirme süreçlerini tamamlayacak firmalar.',
    tags: ['belge', 'ruhsat', 'pazara giriş', 'ihracat']
  },
  {
    typeName: 'Yurt İçi Fuar Desteği',
    title: 'Yurt İçi Fuar Desteği',
    description: 'Bakanlık tarafından açıklanan fuarlara katılımlar desteklenir.',
    maxAmount: 303563,
    supportRate: 60,
    provider: 'Ticaret Bakanlığı',
    eligibilityCriteria: 'Bakanlık tarafından açıklanan yurt içi fuarlara katılım.',
    tags: ['fuar', 'yurt içi', 'tanıtım', 'ihracat']
  },
  {
    typeName: 'Pazara Giriş Projesi Hazırlama Desteği',
    title: 'Pazara Giriş Projesi Hazırlama Desteği',
    description: 'Projenin hazırlanması için Bakanlık tarafından belirlenmiş şirketlerden alınan danışmanlık ve rapor harcamaları desteklenir.',
    maxAmount: 761017,
    supportRate: 70,
    provider: 'Ticaret Bakanlığı',
    eligibilityCriteria: 'Bakanlık onaylı danışmanlık şirketlerinden hizmet alacak firmalar.',
    tags: ['proje', 'danışmanlık', 'pazara giriş', 'ihracat']
  },
  {
    typeName: 'Yurt Dışı Pazar Araştırması Desteği',
    title: 'Yurt Dışı Pazar Araştırması Desteği',
    description: 'Onaylı pazara giriş projesi olan şirketler bir takvim yılında en fazla 5 defa, toplamda ise en fazla 20 kez yararlanabilirler.',
    maxAmount: 379455,
    supportRate: 70,
    provider: 'Ticaret Bakanlığı',
    eligibilityCriteria: 'Onaylı pazara giriş projesi olan şirketler. Yıllık 5, toplam 20 başvuru hakkı.',
    tags: ['pazar araştırması', 'yurt dışı', 'analiz', 'ihracat']
  },
  {
    typeName: 'Yurt Dışı Şirket ve Marka Alım Desteği',
    title: 'Yurt Dışı Şirket ve Yurt Dışında Yerleşik Şirkete Ait Marka Alım Desteği',
    description: 'İleri teknolojiye sahip alımlarda destek limiti artar. Marka alımında kullanılan kredi faiz giderlerinin belirli bir kısmı da desteklenir.',
    maxAmount: 11444788,
    supportRate: 70,
    provider: 'Ticaret Bakanlığı',
    eligibilityCriteria: 'Yurt dışı şirket ve marka alımı yapacak firmalar. İleri teknoloji alımlarında ek avantajlar.',
    tags: ['şirket alımı', 'marka alımı', 'yatırım', 'ihracat']
  },
  {
    typeName: 'Çok Kanallı Zincir Mağaza Desteği',
    title: 'Çok Kanallı Zincir Mağaza Desteği',
    description: 'Çok kanallı zincir mağaza marka sahibi şirketlerin yurt dışına yönelik tanıtım, kira, marka tescil gibi belirlenmiş giderleri desteklenir.',
    maxAmount: 245610000,
    supportRate: 70,
    provider: 'Ticaret Bakanlığı',
    eligibilityCriteria: 'Çok kanallı zincir mağaza marka sahibi şirketler.',
    tags: ['zincir mağaza', 'perakende', 'çok kanal', 'ihracat']
  },
  {
    typeName: 'Gemi ve Yat Sektörü Tasarım Desteği',
    title: 'Gemi ve Yat Sektörü Tasarım Desteği',
    description: 'Tasarım hizmeti alımına ilişkin giderler 5 yıl süreyle desteklenir.',
    maxAmount: 11444788,
    supportRate: 70,
    provider: 'Ticaret Bakanlığı',
    eligibilityCriteria: 'Gemi ve yat sektöründe faaliyet gösteren firmalar. 5 yıl destek süresi.',
    tags: ['gemi', 'yat', 'tasarım', 'denizcilik', 'ihracat']
  }
];

async function createExportIncentives() {
  try {
    console.log('🗄️ Loading models...');
    
    console.log('✅ Models loaded successfully');
    console.log('İhracat sektörü teşvikleri oluşturuluyor...');
    
    // İhracat sektörünü bul
    const exportSector = await Sector.findOne({
      where: { code: 'EXPORT' }
    });
    
    if (!exportSector) {
      console.error('❌ İhracat sektörü bulunamadı!');
      return;
    }
    
    console.log(`İhracat sektörü bulundu: ${exportSector.name} (ID: ${exportSector.id})`);
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const incentiveData of exportIncentivesData) {
      // İlgili teşvik türünü bul
      const incentiveType = await IncentiveType.findOne({
        where: { 
          name: incentiveData.typeName,
          sectorId: exportSector.id 
        }
      });
      
      if (!incentiveType) {
        console.log(`⚠️  Teşvik türü bulunamadı: ${incentiveData.typeName}`);
        continue;
      }
      
      // Mevcut teşviği kontrol et
      const existingIncentive = await Incentive.findOne({
        where: { 
          title: incentiveData.title,
          sectorId: exportSector.id 
        }
      });
      
      if (existingIncentive) {
        console.log(`⏭️  Atlandı: ${incentiveData.title} (zaten mevcut)`);
        skippedCount++;
        continue;
      }
      
      // Yeni teşviği oluştur
      const incentive = await Incentive.create({
        title: incentiveData.title,
        description: incentiveData.description,
        incentiveType: 'support',
        status: 'active',
        provider: incentiveData.provider,
        providerType: 'government',
        maxAmount: incentiveData.maxAmount,
        currency: 'TRY',
        eligibilityCriteria: incentiveData.eligibilityCriteria,
        tags: incentiveData.tags,
        country: 'Turkey',
        sectorId: exportSector.id,
        incentiveTypeId: incentiveType.id
      });
      
      console.log(`✅ Oluşturuldu: ${incentive.title} (Tutar: ${incentive.maxAmount} TL, Oran: %${incentiveData.supportRate})`);
      createdCount++;
    }
    
    // Özet bilgileri
    const totalIncentives = await Incentive.count({
      where: { 
        sectorId: exportSector.id,
        status: 'active'
      }
    });
    
    console.log('\n📊 Özet:');
    console.log(`✅ ${createdCount} teşvik oluşturuldu`);
    console.log(`⏭️  ${skippedCount} teşvik atlandı`);
    console.log(`📈 İhracat sektöründe toplam ${totalIncentives} aktif teşvik`);
    console.log('İşlem tamamlandı');
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    process.exit(0);
  }
}

createExportIncentives();