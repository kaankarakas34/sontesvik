const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { Sequelize } = require('sequelize');

// Sektör mapping - TEST_USERS.md'deki Türkçe sektörlerden İngilizce enum değerlerine
const sectorMapping = {
  'Bilişim ve Teknoloji': 'technology',
  'İmalat Sanayi': 'manufacturing',
  'Turizm ve Otelcilik': 'tourism',
  'Tarım ve Hayvancılık': 'agriculture',
  'İnşaat ve Gayrimenkul': 'construction',
  'Güvenlik Hizmetleri': 'other',
  'Araştırma ve Geliştirme': 'technology',
  'Sağlık': 'healthcare',
  'Eğitim': 'education',
  'Enerji': 'energy',
  'Belirtilmemiş': null
};

const testUsers = [
  // Admin Kullanıcı
  {
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@tesvik360.com',
    password: 'company123',
    phone: '+90 555 000 00 01',
    role: 'admin',
    status: 'active',
    emailVerified: true,
    sector: 'other'
  },

  // Şirket Kullanıcıları
  {
    firstName: 'Mehmet',
    lastName: 'Demir',
    email: 'info@tekvantaj.com',
    password: 'company123',
    phone: '+90 212 555 010',
    role: 'company',
    status: 'active',
    emailVerified: true,
    companyName: 'TekVantaj Teknoloji A.Ş.',
    companyTaxNumber: '1234567890',
    address: 'Maslak Mahallesi, Büyükdere Caddesi No:123',
    city: 'İstanbul',
    sector: 'technology'
  },
  {
    firstName: 'Ayşe',
    lastName: 'Kaya',
    email: 'contact@innovasyon.com',
    password: 'company123',
    phone: '+90 312 555 020',
    role: 'company',
    status: 'active',
    emailVerified: true,
    companyName: 'İnovasyon Çözümleri Ltd. Şti.',
    companyTaxNumber: '0987654321',
    address: 'Çankaya Mahallesi, Atatürk Bulvarı No:456',
    city: 'Ankara',
    sector: 'manufacturing'
  },
  {
    firstName: 'Ali',
    lastName: 'Çelik',
    email: 'ali@greentech.com',
    password: 'company123',
    phone: '+90 232 555 030',
    role: 'company',
    status: 'active',
    emailVerified: true,
    companyName: 'GreenTech Enerji A.Ş.',
    companyTaxNumber: '1122334455',
    address: 'Alsancak Mahallesi, Kordon Boyu No:789',
    city: 'İzmir',
    sector: 'energy'
  },

  // Üye Kullanıcıları
  {
    firstName: 'Zeynep',
    lastName: 'Kara',
    email: 'admin@greentech.com',
    password: 'company123',
    phone: '+90 555 444 44 44',
    role: 'company',
    status: 'active',
    emailVerified: true,
    companyName: 'GreenTech Energy Ltd.',
    sector: 'energy'
  },
  {
    firstName: 'Mehmet',
    lastName: 'Akın',
    email: 'demo@akintechnology.com',
    password: 'company123',
    phone: '+90 555 111 11 11',
    role: 'company',
    status: 'active',
    emailVerified: true,
    companyName: 'Akın Technology A.Ş.',
    sector: 'technology'
  },
  {
    firstName: 'Ayşe',
    lastName: 'Yılmaz',
    email: 'info@innovasyon.com',
    password: 'company123',
    phone: '+90 555 222 22 22',
    role: 'company',
    status: 'active',
    emailVerified: true,
    companyName: 'İnovasyon Yazılım Ltd. Şti.',
    sector: 'technology'
  },
  {
    firstName: 'Emre',
    lastName: 'Özkan',
    email: 'contact@digitech.com',
    password: 'company123',
    phone: '+90 555 333 33 33',
    role: 'company',
    status: 'pending',
    emailVerified: true,
    companyName: 'DigiTech Solutions A.Ş.',
    sector: 'technology'
  },

  // Danışman Kullanıcıları
  {
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    email: 'consultant@tesvik360.com',
    password: 'company123',
    phone: '+90 212 555 050',
    role: 'consultant',
    status: 'active',
    emailVerified: true,
    sector: 'other'
  },
  {
    firstName: 'Ahmet',
    lastName: 'Expert',
    email: 'ahmet@danismanlik.com',
    password: 'company123',
    phone: '+90 555 555 55 55',
    role: 'consultant',
    status: 'active',
    emailVerified: true,
    sector: 'technology'
  },
  {
    firstName: 'Fatma',
    lastName: 'Expert',
    email: 'fatma@tesvikuzman.com',
    password: 'company123',
    phone: '+90 555 666 66 66',
    role: 'consultant',
    status: 'active',
    emailVerified: true,
    sector: 'manufacturing'
  },
  {
    firstName: 'Mustafa',
    lastName: 'Advisor',
    email: 'mustafa@consultant.com',
    password: 'consultant123',
    phone: '+90 555 777 77 77',
    role: 'consultant',
    status: 'pending',
    emailVerified: true,
    sector: 'other'
  },
  {
    firstName: 'Elif',
    lastName: 'Uzman',
    email: 'elif@uzman.com',
    password: 'consultant123',
    phone: '+90 555 888 88 88',
    role: 'consultant',
    status: 'active',
    emailVerified: true,
    sector: 'technology'
  }
];

// Danışman 1-75 için otomatik kullanıcı oluşturma
for (let i = 1; i <= 75; i++) {
  const sectors = ['technology', 'manufacturing', 'tourism', 'agriculture', 'construction', 'healthcare', 'education', 'energy'];
  const randomSector = sectors[Math.floor(Math.random() * sectors.length)];
  
  testUsers.push({
    firstName: 'Danışman',
    lastName: `Kullanıcı${i}`,
    email: `danisman${i}@tesvik360.com`,
    password: 'consultant123',
    phone: `+9055500000${i.toString().padStart(2, '0')}`,
    role: 'consultant',
    status: 'active',
    emailVerified: true,
    sector: randomSector
  });
}

// Şirket Danışmanları 76-85
const companyConsultants = [
  'Ahmet Kaya', 'Mehmet Demir', 'Mehmet Çelik', 'Ali Öztürk', 'Mustafa Kaya',
  'Zeynep Demir', 'Hatice Arslan', 'Murat Çelik', 'Murat Doğan', 'Emine Demir'
];

companyConsultants.forEach((name, index) => {
  const [firstName, lastName] = name.split(' ');
  const consultantNumber = index + 1;
  
  testUsers.push({
    firstName,
    lastName,
    email: `danisman-sirket${consultantNumber}@tesvik360.com`,
    password: 'consultant123',
    phone: `+90555000200${consultantNumber}`,
    role: 'consultant',
    status: 'active',
    emailVerified: true,
    sector: 'other'
  });
});

// Ek üye kullanıcıları (5-50 arası)
for (let i = 5; i <= 50; i++) {
  const sectors = ['technology', 'manufacturing', 'tourism', 'agriculture', 'construction', 'healthcare', 'education', 'energy', 'finance', 'retail'];
  const randomSector = sectors[Math.floor(Math.random() * sectors.length)];
  const status = Math.random() > 0.8 ? 'pending' : 'active'; // %20 pending, %80 active
  
  testUsers.push({
    firstName: `Üye${i}`,
    lastName: 'Kullanıcı',
    email: `uye${i}@test.com`,
    password: 'company123',
    phone: `+90555${i.toString().padStart(3, '0')}${i.toString().padStart(4, '0')}`,
    role: 'company',
    status: status,
    emailVerified: true,
    companyName: `Test Şirketi ${i}`,
    sector: randomSector
  });
}

const seedTestUsers = async () => {
  try {
    console.log('🌱 Test kullanıcıları oluşturuluyor...');
    
    // Production ortamında seed çalışmasını engelle
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Production ortamında seed işlemi engellendi!');
      return;
    }
    
    // Sadece test kullanıcılarını temizle (email'e göre) - batch'ler halinde
    const testEmails = testUsers.map(user => user.email);
    const { Op } = require('sequelize');
    
    // Test kullanıcılarını güncelle (silme yerine)
    const batchSize = 50;
    for (let i = 0; i < testEmails.length; i += batchSize) {
      const batch = testEmails.slice(i, i + batchSize);
      await User.update(
        { 
          status: 'inactive',
          email: Sequelize.literal("CONCAT(email, '_old_')")
        },
        { 
          where: { 
            email: { [Op.in]: batch } 
          }
        }
      );
    }
    console.log('✅ Mevcut test kullanıcıları temizlendi');
    
    // Şifreleri hash'le ve kullanıcıları oluştur
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      await User.create({
        ...userData,
        password: hashedPassword
      });
    }
    
    console.log(`✅ ${testUsers.length} test kullanıcısı başarıyla oluşturuldu!`);
    console.log('📊 Özet:');
    console.log(`   - Admin: 1`);
    console.log(`   - Şirket: ${testUsers.filter(u => u.role === 'company').length}`);
    console.log(`   - Danışman: ${testUsers.filter(u => u.role === 'consultant').length}`);
    console.log(`   - Aktif: ${testUsers.filter(u => u.status === 'active').length}`);
    console.log(`   - Beklemede: ${testUsers.filter(u => u.status === 'pending').length}`);
    
  } catch (error) {
    console.error('❌ Test kullanıcıları oluşturulurken hata:', error);
    throw error;
  }
};

module.exports = { seedTestUsers, testUsers };

// Eğer bu dosya doğrudan çalıştırılırsa seed'i çalıştır
if (require.main === module) {
  const { sequelize } = require('../models');
  
  seedTestUsers()
    .then(() => {
      console.log('🎉 Seed işlemi tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed işlemi başarısız:', error);
      process.exit(1);
    });
}