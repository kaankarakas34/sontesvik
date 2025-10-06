'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ensure enums exist (idempotent)
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_Incentives_incentive_type" AS ENUM ('grant','loan','tax_exemption','support');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_Incentives_status" AS ENUM ('active','inactive','expired','planned');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_Incentives_provider_type" AS ENUM ('government','private','ngo','international');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    const table = await queryInterface.describeTable('Incentives').catch(() => ({}));
    const addIfMissing = async (column, definition) => {
      if (!table[column]) {
        await queryInterface.addColumn('Incentives', column, definition);
      }
    };

    // Core columns as per model
    await addIfMissing('title', { type: Sequelize.STRING(255), allowNull: false });
    await addIfMissing('description', { type: Sequelize.TEXT, allowNull: false });
    await addIfMissing('incentive_type', { type: Sequelize.ENUM('grant','loan','tax_exemption','support'), allowNull: false });
    await addIfMissing('status', { type: Sequelize.ENUM('active','inactive','expired','planned'), allowNull: false, defaultValue: 'planned' });
    await addIfMissing('provider', { type: Sequelize.STRING(150), allowNull: false, defaultValue: 'Unknown' });
    await addIfMissing('provider_type', { type: Sequelize.ENUM('government','private','ngo','international'), allowNull: false, defaultValue: 'government' });
    await addIfMissing('application_deadline', { type: Sequelize.DATE, allowNull: true });
    await addIfMissing('start_date', { type: Sequelize.DATE, allowNull: true });
    await addIfMissing('end_date', { type: Sequelize.DATE, allowNull: true });
    await addIfMissing('max_amount', { type: Sequelize.DECIMAL(15,2), allowNull: true });
    await addIfMissing('min_amount', { type: Sequelize.DECIMAL(15,2), allowNull: true });
    await addIfMissing('currency', { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'TRY' });
    await addIfMissing('eligibility_criteria', { type: Sequelize.TEXT, allowNull: true });
    await addIfMissing('required_documents', { type: Sequelize.JSONB, allowNull: true });
    await addIfMissing('application_url', { type: Sequelize.STRING(500), allowNull: true });
    await addIfMissing('tags', { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true });
    await addIfMissing('view_count', { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 });
    await addIfMissing('application_count', { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 });
    await addIfMissing('completion_rate', { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 });
    await addIfMissing('rating', { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 });
    await addIfMissing('region', { type: Sequelize.STRING(100), allowNull: true });
    await addIfMissing('country', { type: Sequelize.STRING(100), allowNull: false, defaultValue: 'Turkey' });
    await addIfMissing('deleted_at', { type: Sequelize.DATE, allowNull: true });

    // Helpful indexes (idempotent)
    const addIndexSafe = async (cols, name) => {
      try { await queryInterface.addIndex('Incentives', cols, { name }); }
      catch (e) { if (!String(e?.message||'').includes('already exists')) throw e; }
    };
    await addIndexSafe(['status'], 'incentives_status_idx');
    await addIndexSafe(['incentive_type'], 'incentives_incentive_type_idx');
    await addIndexSafe(['provider_type'], 'incentives_provider_type_idx');
    await addIndexSafe(['region'], 'incentives_region_idx');
    await addIndexSafe(['country'], 'incentives_country_idx');
  },

  down: async (queryInterface, Sequelize) => {
    // Keep data; don't drop columns on down.
    return Promise.resolve();
  }
};


