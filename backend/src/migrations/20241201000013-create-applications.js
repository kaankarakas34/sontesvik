'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create ENUM types first (if they don't exist)
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_Applications_status" AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_Applications_priority" AS ENUM ('low', 'medium', 'high', 'urgent');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.createTable('Applications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      applicationNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        field: 'application_number'
      },
      status: {
        type: Sequelize.ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft'
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
      },
      requestedAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        field: 'requested_amount'
      },
      approvedAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
        field: 'approved_amount'
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'TRY'
      },
      projectTitle: {
        type: Sequelize.STRING(200),
        allowNull: false,
        field: 'project_title'
      },
      projectDescription: {
        type: Sequelize.TEXT,
        allowNull: false,
        field: 'project_description'
      },
      completionPercentage: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'completion_percentage'
      },
      submittedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'submitted_at'
      },
      reviewedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'reviewed_at'
      },
      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'approved_at'
      },
      rejectedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'rejected_at'
      },
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'rejection_reason'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'user_id'
      },
      incentiveId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Incentives',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'incentive_id'
      },
      reviewedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        field: 'reviewed_by'
      },
      approvedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        field: 'approved_by'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'created_at'
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'updated_at'
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'deleted_at'
      }
    });

    // Ensure required columns exist when table already existed without them
    let table = await queryInterface.describeTable('Applications');
    // Ensure status enum type exists (already created above)
    if (!table.status) {
      await queryInterface.addColumn('Applications', 'status', {
        type: Sequelize.ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft'
      });
    }
    // Ensure priority column exists (older schema may not have it)
    if (!table.priority) {
      await queryInterface.addColumn('Applications', 'priority', {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
      });
    }

    // Ensure application_number column exists (older schema may not have it)
    if (!table.application_number) {
      await queryInterface.addColumn('Applications', 'application_number', {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      });
    }

    // Re-describe to reflect any changes above
    table = await queryInterface.describeTable('Applications');

    // Add indexes (idempotent)
    const addIndexSafe = async (table, cols, name) => {
      try {
        await queryInterface.addIndex(table, cols, name ? { name } : undefined);
      } catch (err) {
        if (!String(err?.message || '').includes('already exists')) throw err;
      }
    };
    await addIndexSafe('Applications', ['status'], 'applications_status');
    await addIndexSafe('Applications', ['priority'], 'applications_priority');
    await addIndexSafe('Applications', ['user_id'], 'applications_user_id');
    await addIndexSafe('Applications', ['incentive_id'], 'applications_incentive_id');
    if (table.application_number) {
      await addIndexSafe('Applications', ['application_number'], 'applications_application_number');
    }
    await addIndexSafe('Applications', ['submitted_at'], 'applications_submitted_at');
    await addIndexSafe('Applications', ['created_at'], 'applications_created_at');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Applications');
    
    // Drop ENUM types
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_Applications_status";`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_Applications_priority";`);
  }
};