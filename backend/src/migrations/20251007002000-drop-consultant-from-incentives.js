"use strict";

module.exports = {
	async up(queryInterface) {
		// Drop index if exists, then column
		try {
			await queryInterface.removeIndex("Incentives", "incentives_consultant_id_idx");
		} catch (e) {
			// index may not exist; ignore
		}
		try {
			await queryInterface.removeColumn("Incentives", "consultant_id");
		} catch (e) {
			// column may already be removed; ignore
		}
	},

	async down(queryInterface, Sequelize) {
		// Recreate column if needed
		await queryInterface.addColumn("Incentives", "consultant_id", {
			type: Sequelize.UUID,
			allowNull: true,
			references: { model: "users", key: "id" },
			onUpdate: "CASCADE",
			onDelete: "SET NULL",
		});
		await queryInterface.addIndex("Incentives", ["consultant_id"], { name: "incentives_consultant_id_idx" });
	}
};


