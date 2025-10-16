const { User } = require('./backend/src/models');

async function checkUsers() {
  try {
    const users = await User.findAll({ limit: 5 });
    console.log('Users found:');
    users.forEach(user => {
      console.log(`${user.id} - ${user.email} - ${user.role}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();