const { User } = require('./backend/src/models');
const jwt = require('jsonwebtoken');

async function generateToken() {
  try {
    const user = await User.findOne({ where: { email: 'test@example.com' } });
    
    if (user) {
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role }, 
        process.env.JWT_SECRET || 'your-secret-key', 
        { expiresIn: '24h' }
      );
      console.log('New token:', token);
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

generateToken();