const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../models');

const basicUsers = [
  // Admin
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@tesvik360.com',
    password: 'company123',
    phone: '+90 555 000 00 01',
    role: 'admin',
    status: 'active',
    emailVerified: true,
    sector: 'other'
  },

  // Kullanıcı (Üye)
  {
    firstName: 'Test',
    lastName: 'Kullanıcı',
    email: 'kullanici@test.com',
    password: 'user123',
    phone: '+90 555 111 11 11',
    role: 'member',
    status: 'active',
    emailVerified: true,
    companyName: 'Test Şirketi',
    sector: 'technology'
  },

  // Danışman
  {
    firstName: 'Test',
    lastName: 'Danışman',
    email: 'danisman@test.com',
    password: 'company123',
    phone: '+90 555 222 22 22',
    role: 'consultant',
    status: 'active',
    emailVerified: true,
    sector: 'technology'
  }
];

const seedBasicUsers = async () => {
  try {
    console.log('🌱 Temel kullanıcılar oluşturuluyor...');
    
    // Production ortamında seed çalışmasını engelle
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Production ortamında seed işlemi engellendi!');
      return;
    }
    
    // Güvenli kullanıcı oluşturma - mevcut kullanıcıları korur
    for (const userData of basicUsers) {
      const [user, created] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: {
          ...userData,
          password: await bcrypt.hash(userData.password, 12)
        }
      });
      
      if (created) {
        console.log(`✅ ${user.role} oluşturuldu: ${user.email}`);
      } else {
        console.log(`ℹ️  ${user.role} zaten mevcut: ${user.email}`);
      }
    }
    
    console.log('🎉 Temel kullanıcılar başarıyla oluşturuldu!');
    console.log('📊 Giriş Bilgileri:');
    console.log('   - Admin: admin@tesvik360.com / company123');
    console.log('   - Kullanıcı: kullanici@test.com / user123');
    console.log('   - Danışman: danisman@test.com / company123');
    
  } catch (error) {
    console.error('❌ Kullanıcılar oluşturulurken hata:', error);
    throw error;
  }
};

module.exports = { seedBasicUsers, basicUsers };

// Eğer bu dosya doğrudan çalıştırılırsa seed'i çalıştır
if (require.main === module) {
  const { sequelize } = require('../models');
  
  seedBasicUsers()
    .then(() => {
      console.log('🎉 Seed işlemi tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed işlemi başarısız:', error);
      process.exit(1);
    });
}