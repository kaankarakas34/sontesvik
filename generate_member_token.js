const { User } = require('./backend/src/models');
const jwt = require('jsonwebtoken');

async function generateMemberToken() {
  try {
    const user = await User.findOne({ where: { email: 'member@example.com' } });
    
    if (user) {
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role }, 
        'tesvik360_jwt_secret_key_2025_super_secure', 
        { expiresIn: '24h' }
      );
      console.log('Member token:', token);
    } else {
      console.log('Member user not found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

generateMemberToken();