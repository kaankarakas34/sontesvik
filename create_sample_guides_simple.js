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
    incentiveId: 1, // Sağlık teşviki ID'si
    authorId: 1 // Admin kullanıcı ID'si
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
    incentiveId: 2, // Tıbbi cihaz teşviki ID'si
    authorId: 1 // Admin kullanıcı ID'si
  }
];

async function createSampleGuides() {
  try {
    console.log('🚀 Creating sample incentive guides...');
    
    // First, let's get available incentives
    const incentivesResponse = await axios.get(`${API_BASE_URL}/incentives`);
    const incentives = incentivesResponse.data.data.data; // API returns nested data structure
    
    console.log(`📋 Found ${incentives.length} incentives in database`);
    
    if (incentives.length === 0) {
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
        
        if (existingGuidesResponse.data.data && existingGuidesResponse.data.data.length > 0) {
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
        authorId: guide.authorId,
        isActive: true
      };
      
      try {
        const response = await axios.post(`${API_BASE_URL}/incentive-guides`, guideData);
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

// Run the script
createSampleGuides();