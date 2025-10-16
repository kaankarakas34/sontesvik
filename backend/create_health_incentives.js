const { Incentive, IncentiveType, Sector } = require('./src/models');

const healthIncentives = [
  {
    title: 'Sağlık Teknolojileri Ar-Ge Destek Programı',
    shortDescription: 'Tıbbi cihaz yazılımları ve sağlık teknolojileri Ar-Ge projeleri için %75 hibe desteği',
    description: 'Bu program kapsamında, tıbbi cihaz yazılımları, sağlık teknolojileri ve dijital sağlık çözümleri geliştiren KOBİ\'lere ve start-uplara Ar-Ge harcamalarının %75\'ine kadar hibe desteği sağlanmaktadır. Proje bütçesi 500.000 TL - 5.000.000 TL arasında olabilir.',
    eligibilityCriteria: 'Türkiye\'de kayıtlı KOBİ veya start-up olmak, Sağlık teknolojileri alanında faaliyet göstermek, En az 2 yıllık faaliyet süresine sahip olmak, Ar-Ge merkezi veya yazılım geliştirme ekibine sahip olmak',
    requiredDocuments: JSON.stringify([
      'Proje başvuru formu',
      'İş planı ve proje tanımı',
      'Şirket bilgileri ve finansal raporlar',
      'Ar-Ge ekibi CV\'leri',
      'Teknik dokümantasyon ve prototip sunumu'
    ]),
    status: 'active'
  },
  {
    title: 'Tıbbi Cihaz Üretimi İhracat Teşviki',
    shortDescription: 'Tıbbi cihaz üreticilerine ihracat başına 50.000-200.000 TL arası destek',
    description: 'Türkiye\'de üretilen tıbbi cihazların yurt dışına satışını teşvik etmek amacıyla, ihracat tutarının %10-20\'si oranında destek sağlanmaktadır. Destek tutarı 50.000 TL ile 200.000 TL arasında değişmektedir.',
    eligibilityCriteria: 'Türkiye\'de tıbbi cihaz üretimi lisansına sahip olmak, ISO 13485 kalite belgesine sahip olmak, Son 2 yılda minimum 1 milyon TL ihracat hacmine sahip olmak, Ürünlerin CE belgeli olması',
    requiredDocuments: JSON.stringify([
      'İhracat fatura ve gümrük beyanları',
      'Tıbbi cihaz üretim ve satış izin belgeleri',
      'ISO 13485 kalite belgesi',
      'CE işareti ve uygunluk beyanı',
      'İhracat performans raporu'
    ]),
    status: 'active'
  },
  {
    title: 'Dijital Sağlık Platformları Geliştirme Desteği',
    shortDescription: 'Tele-tıp, dijital sağlık ve hasta yönetim sistemleri için 250.000 TL hibe',
    description: 'Tele-tıp, dijital hasta takip sistemleri, sağlık veri analitiği ve yapay zeka destekli teşhis sistemleri gibi dijital sağlık çözümleri geliştiren şirketlere 100.000 TL - 250.000 TL arasında hibe desteği sağlanmaktadır.',
    eligibilityCriteria: 'Yazılım geliştirme kapasitesine sahip olmak, Sağlık Bakanlığı onaylı dijital sağlık çözümü sunmak, Veri güvenliği ve gizlilik standartlarını karşılamak, Minimum 3 yazılım geliştirici istihdam etmek',
    requiredDocuments: JSON.stringify([
      'Yazılım mimari dokümantasyonu',
      'Veri güvenliği ve gizlilik politikası',
      'Sağlık Bakanlığı onay belgesi',
      'Yazılım geliştirici ekibi listesi',
      'Kullanıcı test raporları'
    ]),
    status: 'active'
  },
  {
    title: 'Sağlık Turizmi Yatırım ve İşletme Desteği',
    shortDescription: 'Sağlık turizmi belgeli tesisler için %40 yatırım, %20 işletme desteği',
    description: 'Sağlık turizmi kapsamında uluslararası hasta kabul eden hastaneler, termal tesisler ve rehabilitasyon merkezleri için yatırım tutarının %40\'ına kadar destek ve yıllık işletme giderlerinin %20\'si oranında destek sağlanmaktadır.',
    eligibilityCriteria: 'Sağlık Bakanlığı sağlık turizmi belgesine sahip olmak, Uluslararası hasta kabulü için gerekli altyapıya sahip olmak, Yıllık minimum 500 yabancı hasta kabul etmek, TURSAB belgeli turizm faaliyet iznine sahip olmak',
    requiredDocuments: JSON.stringify([
      'Sağlık turizmi belgesi',
      'Turizm işletme belgesi',
      'Uluslararası hasta kabul sözleşmeleri',
      'Yıllık hasta istatistikleri',
      'Kalite ve akreditasyon belgeleri'
    ]),
    status: 'active'
  },
  {
    title: 'Hastane ve Klinik Altyapı Yatırım Teşviki',
    shortDescription: 'Yeni hastane ve klinik kurulumları için %30-50 oranında yatırım teşviki',
    description: 'Sağlık sektöründe yeni yatırım yapan özel hastaneler, klinikler ve sağlık merkezleri için yatırım tutarının %30-50\'si oranında teşvik desteği. Bu teşvik, inşaat, tıbbi cihaz alımı ve teknoloji yatırımlarını kapsamaktadır.',
    eligibilityCriteria: 'Türkiye\'de yasal olarak faaliyet gösterme hakkına sahip olmak, En az 50 yatak kapasiteli hastane veya 5 uzman hekimli klinik olmak, SGK ile sözleşmeli sağlık hizmeti sunmak, Yatırım tutarı minimum 5.000.000 TL olmak',
    requiredDocuments: JSON.stringify([
      'Yatırım teşvik belgesi başvurusu',
      'İmar planı ve mimari projeler',
      'Çevresel etki değerlendirme raporu',
      'SGK sözleşmesi veya başvurusu',
      'Finansal kaynak gösterimi'
    ]),
    status: 'active'
  }
];

async function createHealthIncentives() {
  try {
    // Sağlık sektörünü bul
    const healthSector = await Sector.findOne({ where: { code: 'HEALTH' } });
    
    if (!healthSector) {
      console.log('❌ Sağlık sektörü bulunamadı!');
      return;
    }

    console.log(`✅ Sağlık sektörü bulundu: ${healthSector.name} (${healthSector.id})`);

    // Incentive türlerini bul
    const incentiveTypes = await IncentiveType.findAll();
    console.log(`📋 Mevcut teşvik türleri: ${incentiveTypes.length}`);

    if (incentiveTypes.length === 0) {
      console.log('❌ Teşvik türü bulunamadı! Önce teşvik türleri oluşturmalısınız.');
      return;
    }

    // Her bir teşvik için
    for (const incentiveData of healthIncentives) {
      // Aynı isimde teşvik var mı kontrol et
      const existingIncentive = await Incentive.findOne({
        where: { title: incentiveData.title }
      });

      if (existingIncentive) {
        console.log(`⏭️  ${incentiveData.title} zaten var, atlanıyor...`);
        continue;
      }

      // Rastgele bir teşvik türü seç
      const randomType = incentiveTypes[Math.floor(Math.random() * incentiveTypes.length)];

      // Yeni teşvik oluştur
      const newIncentive = await Incentive.create({
        title: incentiveData.title,
        description: incentiveData.description,
        incentiveType: 'grant',
        status: incentiveData.status,
        provider: 'T.C. Sağlık Bakanlığı',
        providerType: 'government',
        eligibilityCriteria: incentiveData.eligibilityCriteria,
        requiredDocuments: incentiveData.requiredDocuments,
        sectorId: healthSector.id,
        typeId: randomType.id
      });

      console.log(`✅ ${newIncentive.title} teşviği oluşturuldu`);
    }

    console.log('\n🎉 Sağlık sektörü teşvikleri başarıyla oluşturuldu!');
    
    // Son durumu göster
    const healthIncentivesCount = await Incentive.count({
      where: { sectorId: healthSector.id, status: 'active' }
    });
    
    console.log(`📊 Sağlık sektöründe toplam aktif teşvik sayısı: ${healthIncentivesCount}`);

  } catch (error) {
    console.error('❌ Hata oluştu:', error.message);
  } finally {
    process.exit(0);
  }
}

// Fonksiyonu çalıştır
createHealthIncentives();