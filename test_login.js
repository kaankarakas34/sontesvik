const { User } = require('./backend/src/models');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    // Admin kullanıcısını bul
    const user = await User.findOne({ 
      where: { email: 'admin@tesvik360.com' },
      attributes: { include: ['password'] }
    });
    
    if (!user) {
      console.log('❌ Kullanıcı bulunamadı');
      return;
    }
    
    console.log('✅ Kullanıcı bulundu:', user.email);
    console.log('📧 Email:', user.email);
    console.log('👤 Role:', user.role);
    console.log('📊 Status:', user.status);
    console.log('🔐 Password hash:', user.password ? user.password.substring(0, 20) + '...' : 'No password');
    
    // Şifre testleri
    const passwords = ['test123', 'company123', 'admin123'];
    
    for (const password of passwords) {
      const isValid = await bcrypt.compare(password, user.password);
      console.log(`🔍 Password "${password}": ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

testLogin();