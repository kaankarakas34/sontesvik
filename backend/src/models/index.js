const { Sequelize } = require('sequelize');
const { config } = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions,
    define: {
      underscored: true
    }
  }
);

// Import models
const User = require('./User')(sequelize);
const Sector = require('./Sector')(sequelize);
const IncentiveCategory = require('./IncentiveCategory')(sequelize);
const IncentiveType = require('./IncentiveType')(sequelize);
const DocumentType = require('./DocumentType')(sequelize);
const Incentive = require('./Incentive')(sequelize);
const Application = require('./Application')(sequelize);
const Document = require('./Document')(sequelize);
const IncentiveDocument = require('./IncentiveDocument')(sequelize);
const Notification = require('./Notification')(sequelize);
const Ticket = require('./Ticket')(sequelize);
const TicketMessage = require('./TicketMessage')(sequelize);
const IncentiveGuide = require('./IncentiveGuide')(sequelize);
const DocumentIncentiveMapping = require('./DocumentIncentiveMapping')(sequelize);
const ConsultantAssignmentLog = require('./ConsultantAssignmentLog')(sequelize);
const ConsultantReview = require('./ConsultantReview')(sequelize);
const ApplicationRoom = require('./ApplicationRoom')(sequelize);
const ApplicationMessage = require('./ApplicationMessage')(sequelize);
const ApplicationIncentive = require('./ApplicationIncentive')(sequelize);

// Call associate methods if they exist
Object.keys(sequelize.models).forEach(modelName => {
  if (sequelize.models[modelName].associate) {
    sequelize.models[modelName].associate(sequelize.models);
  }
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  Sequelize,
  User,
  Incentive,
  Application,
  Document,
  Sector,
  IncentiveCategory,
  IncentiveType,
  DocumentType,
  IncentiveDocument,
  Notification,
  Ticket,
  TicketMessage,
  IncentiveGuide,
  DocumentIncentiveMapping,
  ConsultantAssignmentLog,
  ConsultantReview,
  ApplicationRoom,
  ApplicationMessage,
  ApplicationIncentive
};