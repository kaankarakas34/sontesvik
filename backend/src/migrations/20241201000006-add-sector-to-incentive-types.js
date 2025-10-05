'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if sectorId column already exists
    const tableDescription = await queryInterface.describeTable('IncentiveTypes');
    
    if (!tableDescription.sectorId) {
      // Add sectorId column as nullable first
      await queryInterface.addColumn('IncentiveTypes', 'sectorId', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Sectors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      });

      // Get the first sector to use as default
      const [sectors] = await queryInterface.sequelize.query(
        'SELECT id FROM "Sectors" ORDER BY "sortOrder" ASC LIMIT 1'
      );

      if (sectors.length > 0) {
        const defaultSectorId = sectors[0].id;
        
        // Update existing records with default sector
        await queryInterface.sequelize.query(
          'UPDATE "IncentiveTypes" SET "sectorId" = :sectorId WHERE "sectorId" IS NULL',
          {
            replacements: { sectorId: defaultSectorId }
          }
        );
      }

      // Now make the column NOT NULL
      await queryInterface.changeColumn('IncentiveTypes', 'sectorId', {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Sectors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      });

      // Add index for performance
      await queryInterface.addIndex('IncentiveTypes', ['sectorId'], {
        name: 'incentive_types_sector_id_idx'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove index first
    await queryInterface.removeIndex('IncentiveTypes', 'incentive_types_sector_id_idx');
    
    // Remove the column
    await queryInterface.removeColumn('IncentiveTypes', 'sectorId');
  }
};