const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Sector = sequelize.define('Sector', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Sector name is required' },
        len: {
          args: [2, 100],
          msg: 'Sector name must be between 2 and 100 characters'
        }
      }
    },

    code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      validate: {
        len: {
          args: [0, 20],
          msg: 'Sector code cannot exceed 20 characters'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    descriptionEn: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'descriptionEn' // Database'de descriptionEn olarak saklanacak
    },



    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Icon class or name for UI display'
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: true,
      validate: {
        is: {
          args: /^#[0-9A-F]{6}$/i,
          msg: 'Color must be a valid hex color code'
        }
      }
    },
    incentiveCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    userCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Additional sector-specific metadata'
    }
  }, {
    tableName: 'Sectors',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['name']
      },
      {
        unique: true,
        fields: ['code'],
        where: {
          code: {
            [sequelize.Sequelize.Op.ne]: null
          }
        }
      }
    ]
  });

  // Define associations
  Sector.associate = function(models) {
    Sector.belongsToMany(models.Incentive, { 
      through: 'SectorIncentive', 
      foreignKey: 'sector_id',
      otherKey: 'incentive_id'
    });
  };

  // Instance methods
  Sector.prototype.incrementIncentiveCount = async function() {
    return this.increment('incentiveCount');
  };

  Sector.prototype.decrementIncentiveCount = async function() {
    if (this.incentiveCount > 0) {
      return this.decrement('incentiveCount');
    }
    return this;
  };

  Sector.prototype.incrementUserCount = async function() {
    return this.increment('userCount');
  };

  Sector.prototype.decrementUserCount = async function() {
    if (this.userCount > 0) {
      return this.decrement('userCount');
    }
    return this;
  };

  // Class methods
  Sector.findActive = function() {
    return this.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
  };

  return Sector;
};