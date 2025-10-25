const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Membership = sequelize.define('Membership', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'company_id',
      references: {
        model: 'users', // 'users' table
        key: 'id'
      }
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_date'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_date'
    },
    monthlyFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'monthly_fee'
    },
    paymentStatus: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      field: 'payment_status',
      validate: {
        isIn: {
          args: [['pending', 'paid', 'overdue']],
          msg: 'Payment status must be pending, paid, or overdue'
        }
      }
    }
  }, {
    tableName: 'memberships',
    timestamps: true,
    paranoid: true, // Enable soft deletes
    indexes: [
      {
        fields: ['company_id']
      },
      {
        fields: ['payment_status']
      }
    ]
  });

  Membership.associate = function(models) {
    Membership.belongsTo(models.User, { foreignKey: 'companyId', as: 'company' });
  };

  return Membership;
};