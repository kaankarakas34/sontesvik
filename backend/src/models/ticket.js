'use strict';
const {
  Model, DataTypes
} = require('sequelize');
module.exports = (sequelize) => {
  class Ticket extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Ticket.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Ticket.belongsTo(models.Incentive, { foreignKey: 'incentiveId', as: 'incentive' });
      Ticket.belongsTo(models.User, { foreignKey: 'consultantId', as: 'consultant' });
      Ticket.hasMany(models.TicketMessage, { foreignKey: 'ticketId', as: 'messages' });
    }
  }
  Ticket.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: DataTypes.STRING,
    description: {
      type: DataTypes.TEXT
    },
    type: {
      type: DataTypes.ENUM('technical', 'consultant')
    },
    status: {
      type: DataTypes.ENUM('open', 'in-progress', 'closed')
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high')
    },
    userId: {
      type: DataTypes.UUID
    },
    consultantId: {
        type: DataTypes.UUID
    },
    incentiveId: {
        type: DataTypes.UUID
    },
    sectorId: {
        type: DataTypes.INTEGER
    }
  }, {
    sequelize,
    modelName: 'Ticket',
  });
  return Ticket;
};