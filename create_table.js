const { sequelize } = require('./backend/src/models');

async function createApplicationIncentivesTable() {
  try {
    console.log('Creating ApplicationIncentives table...');
    
    // Create the table manually
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "ApplicationIncentives" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id UUID NOT NULL,
        incentive_id UUID NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(application_id, incentive_id)
      )
    `);
    
    // Add foreign key constraints
    await sequelize.query(`
      ALTER TABLE "ApplicationIncentives" 
      ADD CONSTRAINT fk_application 
      FOREIGN KEY (application_id) REFERENCES "Applications"(id)
    `);
    
    await sequelize.query(`
      ALTER TABLE "ApplicationIncentives" 
      ADD CONSTRAINT fk_incentive 
      FOREIGN KEY (incentive_id) REFERENCES "Incentives"(id)
    `);
    
    // Create indexes
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_application_incentives_application_id ON "ApplicationIncentives"(application_id)`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_application_incentives_incentive_id ON "ApplicationIncentives"(incentive_id)`);
    
    console.log('ApplicationIncentives table created successfully!');
    
    // Verify the table exists
    const [results] = await sequelize.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ApplicationIncentives')");
    console.log('ApplicationIncentives table exists:', results[0].exists);
    
  } catch (error) {
    console.error('Error creating table:', error.message);
  } finally {
    await sequelize.close();
  }
}

createApplicationIncentivesTable();