const { sequelize } = require('./backend/src/models');

async function fixEnumTypes() {
  try {
    console.log('Fixing enum types...');
    
    // Drop existing enum types if they exist
    const enumTypes = [
      'enum_consultant_assignment_logs_assignment_type'
    ];
    
    for (const enumType of enumTypes) {
      try {
        await sequelize.query(`DROP TYPE IF EXISTS "${enumType}" CASCADE;`);
        console.log(`Dropped enum type: ${enumType}`);
      } catch (error) {
        console.log(`Could not drop ${enumType}:`, error.message);
      }
    }
    
    // Drop the problematic table if it exists
    await sequelize.query(`DROP TABLE IF EXISTS "consultant_assignment_logs" CASCADE;`);
    console.log('Dropped consultant_assignment_logs table');
    
    console.log('Enum types fixed successfully!');
    
  } catch (error) {
    console.error('Error fixing enum types:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixEnumTypes();