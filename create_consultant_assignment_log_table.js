const { sequelize } = require('./backend/src/models');

async function createConsultantAssignmentLogTable() {
  try {
    console.log('Creating consultant_assignment_logs table...');
    
    // First create the enum type
    await sequelize.query(`
      CREATE TYPE assignment_type_enum AS ENUM ('manual', 'automatic');
    `);
    
    // Create the table manually
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "consultant_assignment_logs" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "application_id" UUID NOT NULL REFERENCES "Applications" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "consultant_id" UUID NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "assigned_by" UUID REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "assignment_type" assignment_type_enum NOT NULL,
        "reason" TEXT,
        "sector" VARCHAR(50) NOT NULL,
        "previous_consultant_id" UUID REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "unassigned_at" TIMESTAMP WITH TIME ZONE,
        "unassigned_by" UUID REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "unassignment_reason" TEXT,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "consultant_assignment_logs_application_id" 
      ON "consultant_assignment_logs" ("application_id");
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "consultant_assignment_logs_consultant_id" 
      ON "consultant_assignment_logs" ("consultant_id");
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "consultant_assignment_logs_assigned_by" 
      ON "consultant_assignment_logs" ("assigned_by");
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "consultant_assignment_logs_assignment_type" 
      ON "consultant_assignment_logs" ("assignment_type");
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "consultant_assignment_logs_sector" 
      ON "consultant_assignment_logs" ("sector");
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "consultant_assignment_logs_created_at" 
      ON "consultant_assignment_logs" ("created_at");
    `);
    
    console.log('consultant_assignment_logs table created successfully!');
    
    // Verify table creation
    const [exists] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'consultant_assignment_logs'
      )
    `);
    
    console.log('Table exists:', exists[0].exists);
    
  } catch (error) {
    console.error('Error creating table:', error.message);
    if (error.message.includes('already exists')) {
      console.log('Table or enum type already exists, continuing...');
    }
  } finally {
    await sequelize.close();
  }
}

createConsultantAssignmentLogTable();