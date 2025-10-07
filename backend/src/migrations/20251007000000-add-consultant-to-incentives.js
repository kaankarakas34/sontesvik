"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("Incentives", "consultant_id", {
			type: Sequelize.UUID,
			allowNull: true,
			references: {
				model: "users",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "SET NULL",
		});

		await queryInterface.addIndex("Incentives", ["consultant_id"], {
			name: "incentives_consultant_id_idx",
		});
	},

	async down(queryInterface) {
		await queryInterface.removeIndex("Incentives", "incentives_consultant_id_idx");
		await queryInterface.removeColumn("Incentives", "consultant_id");
	},
};


