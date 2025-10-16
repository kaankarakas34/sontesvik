const { Sector } = require('./src/models');

async function listSectors() {
  try {
    const sectors = await Sector.findAll();
    
    console.log('📋 Tüm Sektörler:');
    console.log('='.repeat(50));
    
    sectors.forEach(s => {
      console.log(`✅ ${s.name} (${s.code})`);
      console.log(`   Açıklama: ${s.description}`);
      console.log(`   Aktif: ${s.isActive ? 'Evet' : 'Hayır'}`);
      console.log(`   Kullanıcı Sayısı: ${s.userCount}`);
      console.log(`   Teşvik Sayısı: ${s.incentiveCount}`);
      console.log('-'.repeat(30));
    });
    
    console.log(`\n🎯 Toplam ${sectors.length} sektör bulundu.`);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    process.exit(0);
  }
}

listSectors();