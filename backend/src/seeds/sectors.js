const { Sequelize } = require('sequelize');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Initialize Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log
  }
);

// Import models
const { Sector } = require('../models');

const sectorsData = [
  {
    name: 'Teknoloji',
    nameEn: 'Technology',
    code: 'TECH',
    description: 'Bilişim teknolojileri ve yazılım geliştirme sektörü',
    descriptionEn: 'Information technology and software development sector',
    level: 1,
    sortOrder: 1,
    isActive: true,
    icon: 'FaLaptopCode',
    color: '#3B82F6',
    incentiveCount: 0,
    userCount: 0,
    metadata: {}
  },
  {
    name: 'Sağlık',
    nameEn: 'Healthcare',
    code: 'HEALTH',
    description: 'Sağlık hizmetleri ve tıbbi teknolojiler sektörü',
    descriptionEn: 'Healthcare services and medical technologies sector',
    level: 1,
    sortOrder: 2,
    isActive: true,
    icon: 'FaHeartbeat',
    color: '#EF4444',
    incentiveCount: 0,
    userCount: 0,
    metadata: {}
  },
  {
    name: 'Eğitim',
    nameEn: 'Education',
    code: 'EDU',
    description: 'Eğitim hizmetleri ve eğitim teknolojileri sektörü',
    descriptionEn: 'Education services and educational technologies sector',
    level: 1,
    sortOrder: 3,
    isActive: true,
    icon: 'FaGraduationCap',
    color: '#10B981',
    incentiveCount: 0,
    userCount: 0,
    metadata: {}
  },
  {
    name: 'Finans',
    nameEn: 'Finance',
    code: 'FIN',
    description: 'Finansal hizmetler ve fintech sektörü',
    descriptionEn: 'Financial services and fintech sector',
    level: 1,
    sortOrder: 4,
    isActive: true,
    icon: 'FaChartLine',
    color: '#F59E0B',
    incentiveCount: 0,
    userCount: 0,
    metadata: {}
  },
  {
    name: 'Enerji',
    nameEn: 'Energy',
    code: 'ENERGY',
    description: 'Enerji üretimi ve yenilenebilir enerji sektörü',
    descriptionEn: 'Energy production and renewable energy sector',
    level: 1,
    sortOrder: 5,
    isActive: true,
    icon: 'FaBolt',
    color: '#8B5CF6',
    incentiveCount: 0,
    userCount: 0,
    metadata: {}
  }
];

async function seedSectors() {
  try {
    console.log('🌱 Starting sectors seeding...');
    
    // Check if sectors already exist
    const existingSectors = await Sector.count();
    if (existingSectors > 0) {
      console.log(`⚠️  Found ${existingSectors} existing sectors. Skipping seed.`);
      return;
    }

    // Create sectors
    const createdSectors = await Sector.bulkCreate(sectorsData, {
      validate: true,
      returning: true
    });

    console.log(`✅ Successfully created ${createdSectors.length} sectors:`);
    createdSectors.forEach(sector => {
      console.log(`   - ${sector.name} (${sector.code})`);
    });

  } catch (error) {
    console.error('❌ Error seeding sectors:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the seeder
if (require.main === module) {
  seedSectors()
    .then(() => {
      console.log('🎉 Sectors seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Sectors seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedSectors, sectorsData };