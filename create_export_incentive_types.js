const { IncentiveType, Sector } = require('./backend/src/models');

async function createExportIncentiveTypes() {
  try {
    console.log('İhracat sektörü teşvik türleri oluşturuluyor...');
    
    // İhracat sektörünü bul
    const exportSector = await Sector.findOne({
      where: { code: 'EXPORT' }
    });
    
    if (!exportSector) {
      throw new Error('İhracat sektörü bulunamadı! Önce sektörü oluşturun.');
    }
    
    console.log('İhracat sektörü bulundu:', exportSector.name, '(ID:', exportSector.id + ')');
    
    // İhracat teşvik türleri
    const incentiveTypes = [
      {
        name: 'Yurt Dışı Birim Kira Desteği',
        code: 'EXPORT_OFFICE_RENT',
        description: 'Hedef ve öncelikli ülkelerde yurt dışı birim kira giderlerine yönelik destek',
        category: 'Yurt Dışı Operasyon',
        tags: ['kira', 'yurt dışı', 'birim', 'ofis']
      },
      {
        name: 'Yurt Dışı Fuar Desteği',
        code: 'EXPORT_FAIR_SUPPORT',
        description: 'Bakanlık tarafından açıklanan fuarlara katılım desteği',
        category: 'Tanıtım ve Pazarlama',
        tags: ['fuar', 'tanıtım', 'katılım', 'pazarlama']
      },
      {
        name: 'Yurt Dışı Tanıtım Desteği',
        code: 'EXPORT_PROMOTION',
        description: 'Hedef ve öncelikli ülkelerde tanıtım faaliyetlerine yönelik destek',
        category: 'Tanıtım ve Pazarlama',
        tags: ['tanıtım', 'reklam', 'pazarlama', 'yurt dışı']
      },
      {
        name: 'Yurt Dışı Marka Tescil Desteği',
        code: 'EXPORT_TRADEMARK',
        description: 'Hedef ve öncelikli ülkelerde marka tescil giderlerine yönelik destek',
        category: 'Fikri Mülkiyet',
        tags: ['marka', 'tescil', 'patent', 'yurt dışı']
      },
      {
        name: 'Pazara Giriş Belgesi ve Ruhsatlandırma Desteği',
        code: 'EXPORT_MARKET_ENTRY',
        description: 'İhracat için gerekli belge ve ruhsatlandırma giderlerine yönelik destek',
        category: 'Belgelendirme',
        tags: ['belge', 'ruhsat', 'pazara giriş', 'sertifika']
      },
      {
        name: 'Yurt İçi Fuar Desteği',
        code: 'DOMESTIC_FAIR_SUPPORT',
        description: 'Bakanlık tarafından açıklanan yurt içi fuarlara katılım desteği',
        category: 'Tanıtım ve Pazarlama',
        tags: ['fuar', 'yurt içi', 'katılım', 'tanıtım']
      },
      {
        name: 'Pazara Giriş Projesi Hazırlama Desteği',
        code: 'MARKET_ENTRY_PROJECT',
        description: 'Pazara giriş projesi hazırlama danışmanlık giderlerine yönelik destek',
        category: 'Danışmanlık',
        tags: ['proje', 'danışmanlık', 'pazara giriş', 'rapor']
      },
      {
        name: 'Yurt Dışı Pazar Araştırması Desteği',
        code: 'MARKET_RESEARCH',
        description: 'Yurt dışı pazar araştırması giderlerine yönelik destek',
        category: 'Araştırma ve Geliştirme',
        tags: ['pazar araştırması', 'analiz', 'yurt dışı', 'araştırma']
      },
      {
        name: 'Yurt Dışı Şirket ve Marka Alım Desteği',
        code: 'FOREIGN_ACQUISITION',
        description: 'Yurt dışı şirket ve marka alımına yönelik destek',
        category: 'Yatırım',
        tags: ['şirket alımı', 'marka alımı', 'yatırım', 'satın alma']
      },
      {
        name: 'Çok Kanallı Zincir Mağaza Desteği',
        code: 'MULTI_CHANNEL_STORE',
        description: 'Çok kanallı zincir mağaza operasyonlarına yönelik destek',
        category: 'Perakende',
        tags: ['zincir mağaza', 'perakende', 'çok kanal', 'mağaza']
      },
      {
        name: 'Gemi ve Yat Sektörü Tasarım Desteği',
        code: 'MARINE_DESIGN',
        description: 'Gemi ve yat sektörü tasarım hizmetlerine yönelik destek',
        category: 'Tasarım ve Ar-Ge',
        tags: ['gemi', 'yat', 'tasarım', 'denizcilik']
      }
    ];
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const typeData of incentiveTypes) {
      // Mevcut teşvik türünü kontrol et (name alanını kullan)
      const existingType = await IncentiveType.findOne({
        where: { 
          name: typeData.name,
          sectorId: exportSector.id 
        }
      });
      
      if (existingType) {
        console.log(`⏭️  Atlandı: ${typeData.name} (zaten mevcut)`);
        skippedCount++;
        continue;
      }
      
      // code alanını kaldır, sadece gerekli alanları kullan
      const { code, category, tags, ...cleanTypeData } = typeData;
      
      // Yeni teşvik türünü oluştur
      const incentiveType = await IncentiveType.create({
        ...cleanTypeData,
        sectorId: exportSector.id,
        isActive: true
      });
      
      console.log(`✅ Oluşturuldu: ${incentiveType.name} (ID: ${incentiveType.id})`);
      createdCount++;
    }
    
    // İhracat sektöründeki toplam teşvik türü sayısını güncelle
    const totalTypes = await IncentiveType.count({
      where: { 
        sectorId: exportSector.id,
        isActive: true 
      }
    });
    
    console.log(`\n📊 Özet:`);
    console.log(`✅ ${createdCount} teşvik türü oluşturuldu`);
    console.log(`⏭️  ${skippedCount} teşvik türü atlandı`);
    console.log(`📈 İhracat sektöründe toplam ${totalTypes} aktif teşvik türü`);
    
    return { createdCount, skippedCount, totalTypes };
    
  } catch (error) {
    console.error('İhracat teşvik türleri oluşturulurken hata:', error);
    throw error;
  }
}

// Script doğrudan çalıştırılırsa
if (require.main === module) {
  createExportIncentiveTypes()
    .then(() => {
      console.log('İşlem tamamlandı');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Hata:', error);
      process.exit(1);
    });
}

module.exports = { createExportIncentiveTypes };