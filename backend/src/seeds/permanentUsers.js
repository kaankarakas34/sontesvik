const bcrypt = require('bcryptjs');
const { User } = require('../models');

// Kalıcı kullanıcılar - silinmeyecek
const permanentUsers = [
  {
    id: 'e0ec12c7-e962-46cf-af35-b1da1a9c55d2',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@tesvik360.com',
    password: 'company123',
    phone: '+905555555555',
    role: 'admin',
    status: 'active',
    emailVerified: true,
    companyName: 'Tesvik 360',
    companyTaxNumber: '1234567890',
    sector: 'technology',
  },
  {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    firstName: 'Member',
    lastName: 'User',
    email: 'member@tesvik360.com',
    password: 'company123',
    phone: '+905555555556',
    role: 'company',
    status: 'active',
    emailVerified: true,
    companyName: 'Member Company',
    companyTaxNumber: '0987654321',
    sector: 'manufacturing',
  },
  {
    id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
    firstName: 'Consultant',
    lastName: 'User',
    email: 'consultant@tesvik360.com',
    password: 'company123',
    phone: '+905555555557',
    role: 'consultant',
    status: 'active',
    emailVerified: true,
    companyName: 'Consultant Company',
    companyTaxNumber: '1122334455',
    sector: 'other',
  },
];

const seedPermanentUsers = async () => {
  try {
    console.log('🌱 Kalıcı kullanıcılar için veritabanı hazırlanıyor...');

    for (const userData of permanentUsers) {
      // sectorId olmadan kullanıcıyı oluştur (sadece sector enum kullan)
      const userDataWithoutSectorId = { ...userData };
      delete userDataWithoutSectorId.sectorId;

      // Kullanıcıyı oluştur (şifre User modelindeki beforeCreate hook'u tarafından hash'lenecek)
      await User.create({
        ...userDataWithoutSectorId,
        password: userData.password, // Ham şifre, model tarafından hash'lenecek
      });

      console.log(`✅ Kullanıcı oluşturuldu: ${userData.email} (${userData.role})`);
    }

    console.log(`✅ ${permanentUsers.length} kalıcı kullanıcı işlemi tamamlandı!`);
    console.log('📊 Özet:');
    console.log(`   - Admin: ${permanentUsers.filter((u) => u.role === 'admin').length}`);
    console.log(`   - Üye: ${permanentUsers.filter((u) => u.role === 'member').length}`);
    console.log(`   - Danışman: ${permanentUsers.filter((u) => u.role === 'consultant').length}`);
  } catch (error) {
    console.error('❌ Kalıcı kullanıcılar oluşturulurken hata:', error);
    throw error;
  }
};

module.exports = { seedPermanentUsers, permanentUsers };

// Eğer bu dosya doğrudan çalıştırılırsa seed'i çalıştır
if (require.main === module) {
  const { sequelize } = require('../models');
  
  sequelize.sync({ force: true })
    .then(() => seedPermanentUsers())
    .then(() => {
      console.log('🎉 Kalıcı kullanıcı seed işlemi tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Kalıcı kullanıcı seed işlemi başarısız:', error);
      process.exit(1);
    });
}