const axios = require('axios');

const API_BASE_URL = 'http://localhost:5002/api';

// Sample guide data
const sampleGuides = [
  {
    title: 'Sağlık Teknolojileri Ar-Ge Destek Programı Başvuru Kılavuzu',
    content: `
# Sağlık Teknolojileri Ar-Ge Destek Programı Başvuru Kılavuzu

## Program Hakkında
Bu program, sağlık teknolojileri alanında yenilikçi Ar-Ge projelerini desteklemek amacıyla oluşturulmuştur.

## Başvuru Koşulları
- Türkiye'de kurulu şirket olma
- Sağlık teknolojileri alanında faaliyet gösterme
- En az 3 yıllık faaliyet geçmişi

## Gerekli Belgeler
1. Şirket faaliyet belgesi
2. Proje teknik dosyası
3. Bütçe planı
4. İş planı

## Başvuru Süreci
1. Online başvuru formu doldurma
2. Belgelerin yüklenmesi
3. Ön değerlendirme
4. Teknik değerlendirme
5. Sonuç bildirimi

## Destek Miktarı
- Minimum: 100.000 TL
- Maksimum: 2.000.000 TL
- Geri ödemesiz destek oranı: %75

## İletişim
Sorularınız için: saglik-arge@tesvik360.com
    `,
    requiredDocuments: [
      "Şirket faaliyet belgesi",
      "Proje teknik dosyası", 
      "Bütçe planı",
      "İş planı"
    ],
    applicationSteps: [
      "Online başvuru formu doldurma",
      "Belgelerin yüklenmesi",
      "Ön değerlendirme",
      "Teknik değerlendirme",
      "Sonuç bildirimi"
    ],
    eligibilityCriteria: {
      "company_location": "Türkiye'de kurulu şirket olma",
      "sector": "Sağlık teknolojileri alanında faaliyet gösterme",
      "experience": "En az 3 yıllık faaliyet geçmişi"
    },
    contactInfo: {
      "email": "saglik-arge@tesvik360.com",
      "phone": "0312 XXX XX XX"
    }
  },
  {
    title: 'Tıbbi Cihaz Üretimi İhracat Teşviki Başvuru Kılavuzu',
    content: `
# Tıbbi Cihaz Üretimi İhracat Teşviki Başvuru Kılavuzu

## Program Amacı
Tıbbi cihaz üretimi yapan firmaların ihracat kapasitelerini artırmak ve uluslararası pazarlarda rekabet gücünü desteklemek.

## Hedef Kitle
- Tıbbi cihaz üreticisi firmalar
- İhracat potansiyeli olan KOBİ'ler
- Yenilikçi tıbbi teknoloji firmaları

## Başvuru Kriterleri
- Tıbbi cihaz üretim lisansına sahip olma
- Son 2 yılda ihracat gerçekleştirmiş olma
- CE belgesi veya eşdeğer uluslararası sertifikaya sahip olma

## Desteklenen Faaliyetler
1. Uluslararası fuar katılımları
2. Pazarlama ve tanıtım faaliyetleri
3. Kalite belgelendirme süreçleri
4. İhracat danışmanlığı hizmetleri

## Destek Oranları
- Fuar katılımı: %80 (max 50.000 TL)
- Pazarlama: %60 (max 100.000 TL)
- Belgelendirme: %75 (max 75.000 TL)

## Başvuru Takvimi
- Başvuru açılış: Her yılın Ocak ayı
- Son başvuru: Mart ayı sonu
- Değerlendirme süresi: 2 ay
- Sonuç açıklama: Haziran ayı

## Gerekli Evraklar
1. Başvuru formu
2. Şirket bilgi formu
3. İhracat performans belgesi
4. Proje bütçesi
5. Tıbbi cihaz üretim lisansı

## İletişim Bilgileri
E-posta: tibbi-cihaz@tesvik360.com
Telefon: 0312 XXX XX XX
    `,
    requiredDocuments: [
      "Başvuru formu",
      "Şirket bilgi formu",
      "İhracat performans belgesi",
      "Proje bütçesi",
      "Tıbbi cihaz üretim lisansı"
    ],
    applicationSteps: [
      "Başvuru formunun doldurulması",
      "Gerekli belgelerin hazırlanması",
      "Online başvuru sistemine yükleme",
      "Ön değerlendirme süreci",
      "Teknik değerlendirme",
      "Sonuç bildirimi"
    ],
    eligibilityCriteria: {
      "license": "Tıbbi cihaz üretim lisansına sahip olma",
      "export_history": "Son 2 yılda ihracat gerçekleştirmiş olma",
      "certification": "CE belgesi veya eşdeğer uluslararası sertifikaya sahip olma"
    },
    contactInfo: {
      "email": "tibbi-cihaz@tesvik360.com",
      "phone": "0312 XXX XX XX"
    }
  }
];

async function loginAsAdmin() {
  try {
    console.log('🔐 Logging in as admin...');
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@tesvik360.com',
      password: 'company123'
    });
    
    console.log('Login response:', loginResponse.data);
    
    if (loginResponse.data.success && loginResponse.data.data && loginResponse.data.data.token) {
      console.log('✅ Admin login successful');
      return loginResponse.data.data.token;
    } else if (loginResponse.data.success && loginResponse.data.token) {
      console.log('✅ Admin login successful (alternative structure)');
      return loginResponse.data.token;
    } else {
      throw new Error('Login failed - no token received');
    }
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data || error.message);
    console.error('Full error:', error);
    return null;
  }
}

async function getAdminUserId(token) {
  try {
    console.log('👤 Getting admin user ID...');
    
    const userResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (userResponse.data.success && userResponse.data.data && userResponse.data.data.user) {
      const adminUserId = userResponse.data.data.user.id;
      console.log(`✅ Admin user ID: ${adminUserId}`);
      return adminUserId;
    } else {
      throw new Error('Failed to get admin user profile');
    }
  } catch (error) {
    console.error('❌ Failed to get admin user ID:', error.response?.data || error.message);
    return null;
  }
}

async function createSampleGuides(token, adminUserId) {
  try {
    console.log('🚀 Creating sample incentive guides...');
    
    // Set up axios with auth header
    const authAxios = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Get available incentives
    const incentivesResponse = await axios.get(`${API_BASE_URL}/incentives`);
    const incentives = incentivesResponse.data.data.incentives;
    
    console.log(`📋 Found ${incentives ? incentives.length : 0} incentives in database`);
    
    if (!incentives || incentives.length === 0) {
      console.log('❌ No incentives found. Please run the seed script first.');
      return;
    }
    
    // Create guides for available incentives
    for (let i = 0; i < Math.min(sampleGuides.length, incentives.length); i++) {
      const guide = sampleGuides[i];
      const incentive = incentives[i];
      
      try {
        // Check if guide already exists for this incentive
        const existingGuidesResponse = await axios.get(`${API_BASE_URL}/incentive-guides/incentive/${incentive.id}`);
        
        if (existingGuidesResponse.data.data) {
          console.log(`⚠️ Guide already exists for incentive: ${incentive.title}`);
          continue;
        }
      } catch (error) {
        // If 404, it means no guides exist for this incentive, which is fine
        if (error.response && error.response.status !== 404) {
          console.log(`❌ Error checking existing guides for ${incentive.title}:`, error.message);
          continue;
        }
      }
      
      // Create the guide
      const guideData = {
        title: guide.title,
        content: guide.content,
        incentiveId: incentive.id,
        requiredDocuments: guide.requiredDocuments,
        applicationSteps: guide.applicationSteps,
        eligibilityCriteria: guide.eligibilityCriteria,
        contactInfo: guide.contactInfo,
        isActive: true,
        createdBy: adminUserId,
        updatedBy: adminUserId
      };
      
      try {
        const response = await authAxios.post('/incentive-guides', guideData);
        console.log(`✅ Created guide: ${guide.title}`);
      } catch (error) {
        console.log(`❌ Error creating guide for ${incentive.title}:`, error.response?.data || error.message);
      }
    }
    
    console.log('🎉 Sample guides creation completed!');
    
  } catch (error) {
    console.error('❌ Error creating sample guides:', error.response?.data || error.message);
  }
}

async function main() {
  try {
    // Login as admin
    const token = await loginAsAdmin();
    if (!token) {
      console.log('❌ Cannot proceed without admin token');
      return;
    }

    // Get admin user ID
    const adminUserId = await getAdminUserId(token);
    if (!adminUserId) {
      console.log('❌ Cannot proceed without admin user ID');
      return;
    }

    // Create sample guides with admin credentials
    await createSampleGuides(token, adminUserId);
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
main();