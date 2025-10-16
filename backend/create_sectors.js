const { Sector } = require('./src/models');

const sectors = [
  { name: 'Sağlık', description: 'Hastaneler, klinikler, sağlık teknolojileri ve ilaç sektörü', code: 'HEALTH' },
  { name: 'Teknoloji', description: 'Yazılım, donanım, yapay zeka ve bilişim teknolojileri', code: 'TECH' },
  { name: 'Eğitim', description: 'Okullar, üniversiteler, eğitim teknolojileri ve kurslar', code: 'EDUCATION' },
  { name: 'Üretim', description: 'İmalat sanayi, fabrikalar ve üretim tesisleri', code: 'MANUFACTURING' },
  { name: 'Tarım', description: 'Tarım üretimi, hayvancılık ve tarım teknolojileri', code: 'AGRICULTURE' },
  { name: 'Enerji', description: 'Yenilenebilir enerji, enerji üretimi ve dağıtımı', code: 'ENERGY' }
];

async function createSectors() {
  try {
    console.log('🌱 Sektörler oluşturuluyor...');
    
    for (const sector of sectors) {
      const [createdSector, created] = await Sector.findOrCreate({
        where: { code: sector.code },
        defaults: sector
      });
      
      if (created) {
        console.log(`✅ ${sector.name} sektörü oluşturuldu`);
      } else {
        console.log(`ℹ️  ${sector.name} sektörü zaten mevcut`);
      }
    }
    
    console.log('🎉 Tüm sektörler başarıyla oluşturuldu!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

createSectors();