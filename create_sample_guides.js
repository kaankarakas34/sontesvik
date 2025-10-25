const { IncentiveGuide, Incentive, User } = require('./backend/src/models');

const sampleGuides = [
  {
    title: 'Sağlık Teknolojileri Ar-Ge Destek Programı Başvuru Kılavuzu',
    content: `
      <h2>Sağlık Teknolojileri Ar-Ge Destek Programı</h2>
      <p>Bu program, sağlık teknolojileri alanında yenilikçi Ar-Ge projelerini desteklemek amacıyla oluşturulmuştur.</p>
      
      <h3>Program Kapsamı</h3>
      <ul>
        <li>Tıbbi cihaz geliştirme projeleri</li>
        <li>Dijital sağlık çözümleri</li>
        <li>Biyomedikal teknolojiler</li>
        <li>Teşhis ve tedavi teknolojileri</li>
      </ul>
      
      <h3>Başvuru Koşulları</h3>
      <p>Başvuru yapabilmek için aşağıdaki koşulları sağlamanız gerekmektedir:</p>
      <ul>
        <li>Türkiye'de kurulu bir şirket olması</li>
        <li>En az 2 yıllık faaliyet geçmişi</li>
        <li>Ar-Ge departmanına sahip olması</li>
        <li>Proje süresinin 12-36 ay arasında olması</li>
      </ul>
    `,
    regulations: 'T.C. Sağlık Bakanlığı Ar-Ge Destek Yönetmeliği',
    requiredDocuments: [
      'Şirket faaliyet belgesi',
      'Proje teknik raporu',
      'Bütçe detayı',
      'Ar-Ge personel listesi',
      'Patent araştırma raporu'
    ],
    applicationSteps: [
      'Online başvuru formunun doldurulması',
      'Gerekli belgelerin yüklenmesi',
      'Teknik değerlendirme süreci',
      'Mali değerlendirme',
      'Nihai karar ve sözleşme imzalama'
    ],
    eligibilityCriteria: {
      companyAge: '2 yıl',
      sector: 'Sağlık teknolojileri',
      projectDuration: '12-36 ay',
      rdDepartment: true
    },
    deadlines: {
      applicationDeadline: '2024-12-31',
      projectStartDate: '2025-01-15',
      projectEndDate: '2027-01-15'
    },
    contactInfo: {
      department: 'Sağlık Teknolojileri Genel Müdürlüğü',
      phone: '+90 312 555 0123',
      email: 'saglikteknolojileri@saglik.gov.tr',
      address: 'Ankara, Türkiye'
    },
    faqs: [
      {
        question: 'Proje süresi ne kadar olabilir?',
        answer: 'Proje süresi minimum 12 ay, maksimum 36 ay olabilir.'
      },
      {
        question: 'Hangi giderler desteklenir?',
        answer: 'Personel giderleri, ekipman alımı, sarf malzeme ve hizmet alımı giderleri desteklenir.'
      }
    ]
  },
  {
    title: 'Tıbbi Cihaz Üretimi İhracat Teşviki Başvuru Kılavuzu',
    content: `
      <h2>Tıbbi Cihaz Üretimi İhracat Teşviki</h2>
      <p>Türkiye'de üretilen tıbbi cihazların ihracatını artırmak amacıyla verilen destek programıdır.</p>
      
      <h3>Desteklenen Faaliyetler</h3>
      <ul>
        <li>Tıbbi cihaz üretimi</li>
        <li>İhracat pazarlama faaliyetleri</li>
        <li>Uluslararası sertifikasyon süreçleri</li>
        <li>Yurt dışı fuar katılımları</li>
      </ul>
      
      <h3>Destek Oranları</h3>
      <p>Proje türüne göre %50-75 oranında destek sağlanmaktadır.</p>
    `,
    regulations: 'İhracat Teşvik Yönetmeliği',
    requiredDocuments: [
      'İhracat performans belgesi',
      'Üretim kapasitesi raporu',
      'CE belgesi',
      'ISO 13485 sertifikası',
      'İhracat planı'
    ],
    applicationSteps: [
      'Ön başvuru formu',
      'Belge kontrolü',
      'Teknik inceleme',
      'Onay ve sözleşme'
    ],
    eligibilityCriteria: {
      productType: 'Tıbbi cihaz',
      certification: 'CE, ISO 13485',
      exportExperience: '1 yıl',
      productionCapacity: 'Minimum %20 ihracat'
    },
    deadlines: {
      applicationDeadline: '2024-11-30',
      projectStartDate: '2025-01-01',
      projectEndDate: '2025-12-31'
    },
    contactInfo: {
      department: 'İhracat Genel Müdürlüğü',
      phone: '+90 312 555 0456',
      email: 'ihracat@ticaret.gov.tr',
      address: 'Ankara, Türkiye'
    },
    faqs: [
      {
        question: 'Hangi tıbbi cihazlar desteklenir?',
        answer: 'CE belgeli tüm tıbbi cihazlar destek kapsamındadır.'
      }
    ]
  }
];

async function createSampleGuides() {
  try {
    console.log('🗄️ Loading models...');
    
    // Get all incentives
    const incentives = await Incentive.findAll({
      where: { status: 'active' },
      limit: 5
    });
    
    if (incentives.length === 0) {
      console.log('❌ Aktif teşvik bulunamadı!');
      return;
    }
    
    console.log(`✅ ${incentives.length} aktif teşvik bulundu`);
    
    // Find an admin user to assign as creator
    const adminUser = await User.findOne({
      where: { role: 'admin' }
    });
    
    if (!adminUser) {
      console.log('❌ Admin kullanıcı bulunamadı!');
      return;
    }
    
    console.log(`✅ Admin kullanıcı bulundu: ${adminUser.firstName} ${adminUser.lastName}`);
    
    let createdCount = 0;
    let skippedCount = 0;
    
    // Create guides for the first few incentives
    for (let i = 0; i < Math.min(incentives.length, sampleGuides.length); i++) {
      const incentive = incentives[i];
      const guideTemplate = sampleGuides[i];
      
      // Check if guide already exists
      const existingGuide = await IncentiveGuide.findOne({
        where: { incentiveId: incentive.id }
      });
      
      if (existingGuide) {
        console.log(`⏭️  ${incentive.title} için kılavuz zaten var, atlanıyor...`);
        skippedCount++;
        continue;
      }
      
      // Create new guide
      const newGuide = await IncentiveGuide.create({
        incentiveId: incentive.id,
        title: guideTemplate.title,
        content: guideTemplate.content,
        regulations: guideTemplate.regulations,
        requiredDocuments: guideTemplate.requiredDocuments,
        applicationSteps: guideTemplate.applicationSteps,
        eligibilityCriteria: guideTemplate.eligibilityCriteria,
        deadlines: guideTemplate.deadlines,
        contactInfo: guideTemplate.contactInfo,
        faqs: guideTemplate.faqs,
        isActive: true,
        publishedAt: new Date(),
        createdBy: adminUser.id,
        updatedBy: adminUser.id
      });
      
      console.log(`✅ ${incentive.title} için kılavuz oluşturuldu`);
      createdCount++;
    }
    
    console.log('\n🎉 Örnek kılavuzlar işlemi tamamlandı!');
    console.log(`📊 Oluşturulan: ${createdCount}, Atlanan: ${skippedCount}`);
    
    return { createdCount, skippedCount };
    
  } catch (error) {
    console.error('❌ Örnek kılavuzlar oluşturulurken hata:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  createSampleGuides()
    .then(() => {
      console.log('✅ İşlem tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 İşlem başarısız:', error);
      process.exit(1);
    });
}

module.exports = { createSampleGuides };