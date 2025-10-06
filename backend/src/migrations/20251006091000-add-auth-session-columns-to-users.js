'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('users');

    if (!table.last_login_ip) {
      await queryInterface.addColumn('users', 'last_login_ip', {
        type: Sequelize.STRING(45),
        allowNull: true
      });
    }

    if (!table.current_session_token) {
      await queryInterface.addColumn('users', 'current_session_token', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    if (!table.session_expiry) {
      await queryInterface.addColumn('users', 'session_expiry', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    if (!table.two_factor_secret) {
      await queryInterface.addColumn('users', 'two_factor_secret', {
        type: Sequelize.STRING(32),
        allowNull: true
      });
    }

    if (!table.two_factor_enabled) {
      await queryInterface.addColumn('users', 'two_factor_enabled', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('users');

    if (table.two_factor_enabled) {
      await queryInterface.removeColumn('users', 'two_factor_enabled');
    }
    if (table.two_factor_secret) {
      await queryInterface.removeColumn('users', 'two_factor_secret');
    }
    if (table.session_expiry) {
      await queryInterface.removeColumn('users', 'session_expiry');
    }
    if (table.current_session_token) {
      await queryInterface.removeColumn('users', 'current_session_token');
    }
    if (table.last_login_ip) {
      await queryInterface.removeColumn('users', 'last_login_ip');
    }
  }
};


