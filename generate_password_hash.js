const bcrypt = require('bcryptjs');

async function generatePasswordHash() {
  try {
    const password = 'admin123';
    const saltRounds = 12;
    
    console.log('🔐 Generating hash for password:', password);
    console.log('🧂 Salt rounds:', saltRounds);
    
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('✅ Generated hash:', hash);
    
    // Test the hash
    const isValid = await bcrypt.compare(password, hash);
    console.log('🔍 Hash validation:', isValid ? '✅ VALID' : '❌ INVALID');
    
    // Test with existing hash
    const existingHash = '$2b$12$LQv3c1yqBwEHFl5aBLx/ue5YjgTAlzXRlhHkqJ3swEfRvQjDbHUtW';
    const isExistingValid = await bcrypt.compare(password, existingHash);
    console.log('🔍 Existing hash validation:', isExistingValid ? '✅ VALID' : '❌ INVALID');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

generatePasswordHash();