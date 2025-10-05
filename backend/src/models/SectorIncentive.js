const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SectorIncentive = sequelize.define('SectorIncentive', {
    sectorId: {
      type: DataTypes.UUID,
      references: {
        model: 'Sectors',
        key: 'id'
      },
      field: 'sector_id'
    },
    incentiveId: {
      type: DataTypes.UUID,
      references: {
        model: 'Incentives',
        key: 'id'
      },
      field: 'incentive_id'
    }
  }, {
    tableName: 'sector_incentives',
    timestamps: false
  });

  return SectorIncentive;
};