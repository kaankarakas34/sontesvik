// Minimal test server to identify the issue
console.log('Starting test server...');

try {
  console.log('Loading dotenv...');
  require('dotenv').config();
  
  console.log('Loading express...');
  const express = require('express');
  
  console.log('Loading models...');
  const { sequelize } = require('./src/models');
  
  console.log('Creating app...');
  const app = express();
  
  console.log('Setting up middleware...');
  app.use(express.json());
  
  console.log('Setting up test route...');
  app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
  });
  
  const PORT = process.env.PORT || 5002;
  
  console.log('Starting server on port', PORT);
  app.listen(PORT, () => {
    console.log(`✅ Test server running on port ${PORT}`);
  });
  
} catch (error) {
  console.error('❌ Error starting test server:', error);
  console.error('Stack:', error.stack);
}