'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ensure enum types exist (idempotent)
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_Applications_status" AS ENUM ('draft','submitted','under_review','additional_info_required','approved','rejected','cancelled','completed');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_Applications_priority" AS ENUM ('low','medium','high','urgent');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_Applications_consultant_assignment_type" AS ENUM ('manual','automatic');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    const table = await queryInterface.describeTable('Applications').catch(() => ({}));

    const addIfMissing = async (column, definition) => {
      if (!table[column]) {
        await queryInterface.addColumn('Applications', column, definition);
      }
    };

    // Core columns from model (snake_case field names)
    await addIfMissing('application_number', { type: Sequelize.STRING(50), allowNull: false, unique: true });
    await addIfMissing('status', { type: Sequelize.ENUM('draft','submitted','under_review','additional_info_required','approved','rejected','cancelled','completed'), allowNull: false, defaultValue: 'draft' });
    await addIfMissing('priority', { type: Sequelize.ENUM('low','medium','high','urgent'), allowNull: false, defaultValue: 'medium' });
    await addIfMissing('requested_amount', { type: Sequelize.DECIMAL(15,2), allowNull: false, defaultValue: 0 });
    await addIfMissing('approved_amount', { type: Sequelize.DECIMAL(15,2), allowNull: true, defaultValue: 0 });
    await addIfMissing('currency', { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'TRY' });
    await addIfMissing('project_title', { type: Sequelize.STRING(200), allowNull: false });
    await addIfMissing('project_description', { type: Sequelize.TEXT, allowNull: false });
    await addIfMissing('completion_percentage', { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 });
    await addIfMissing('submitted_at', { type: Sequelize.DATE, allowNull: true });
    await addIfMissing('reviewed_at', { type: Sequelize.DATE, allowNull: true });
    await addIfMissing('approved_at', { type: Sequelize.DATE, allowNull: true });
    await addIfMissing('rejected_at', { type: Sequelize.DATE, allowNull: true });
    await addIfMissing('rejection_reason', { type: Sequelize.TEXT, allowNull: true });
    await addIfMissing('notes', { type: Sequelize.TEXT, allowNull: true });
    await addIfMissing('user_id', { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' });
    await addIfMissing('incentive_id', { type: Sequelize.UUID, allowNull: false, references: { model: 'Incentives', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' });
    await addIfMissing('reviewed_by', { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' });
    await addIfMissing('approved_by', { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' });
    await addIfMissing('assigned_consultant_id', { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' });
    await addIfMissing('consultant_assigned_at', { type: Sequelize.DATE, allowNull: true });
    await addIfMissing('consultant_assignment_type', { type: Sequelize.ENUM('manual','automatic'), allowNull: true });
    await addIfMissing('consultant_notes', { type: Sequelize.TEXT, allowNull: true });
    await addIfMissing('consultant_rating', { type: Sequelize.INTEGER, allowNull: true });
    await addIfMissing('consultant_review', { type: Sequelize.TEXT, allowNull: true });
    await addIfMissing('deleted_at', { type: Sequelize.DATE, allowNull: true });

    // Helpful indexes (idempotent)
    const addIndexSafe = async (cols, name) => {
      try { await queryInterface.addIndex('Applications', cols, { name }); }
      catch (e) { if (!String(e?.message||'').includes('already exists')) throw e; }
    };
    await addIndexSafe(['application_number'], 'applications_application_number');
    await addIndexSafe(['status'], 'applications_status');
    await addIndexSafe(['priority'], 'applications_priority');
    await addIndexSafe(['user_id'], 'applications_user_id');
    await addIndexSafe(['incentive_id'], 'applications_incentive_id');
    await addIndexSafe(['submitted_at'], 'applications_submitted_at');
    await addIndexSafe(['reviewed_at'], 'applications_reviewed_at');
    await addIndexSafe(['approved_at'], 'applications_approved_at');
    await addIndexSafe(['created_at'], 'applications_created_at');
  },

  down: async (queryInterface, Sequelize) => {
    // Down migration keeps it simple: we won't drop columns to avoid data loss.
    return Promise.resolve();
  }
};


