const { Sector } = require('./backend/src/models');

async function createExportSector() {
  try {
    console.log('İhracat sektörü oluşturuluyor...');
    
    // İhracat sektörünün mevcut olup olmadığını kontrol et
    const existingSector = await Sector.findOne({
      where: { code: 'EXPORT' }
    });
    
    if (existingSector) {
      console.log('İhracat sektörü zaten mevcut:', existingSector.name);
      return existingSector;
    }
    
    // İhracat sektörünü oluştur
    const exportSector = await Sector.create({
      name: 'İhracat',
      code: 'EXPORT',
      description: 'İhracat destekleri ve teşvikleri',
      descriptionEn: 'Export supports and incentives',
      is_active: true,
      icon: 'export',
      color: '#2563eb',
      incentive_count: 0,
      user_count: 0,
      metadata: {
        category: 'trade',
        priority: 'high',
        tags: ['ihracat', 'dış ticaret', 'export', 'international trade']
      }
    });
    
    console.log('İhracat sektörü başarıyla oluşturuldu:', exportSector.name);
    console.log('Sektör ID:', exportSector.id);
    
    return exportSector;
    
  } catch (error) {
    console.error('İhracat sektörü oluşturulurken hata:', error);
    throw error;
  }
}

// Script doğrudan çalıştırılırsa
if (require.main === module) {
  createExportSector()
    .then(() => {
      console.log('İşlem tamamlandı');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Hata:', error);
      process.exit(1);
    });
}

module.exports = { createExportSector };