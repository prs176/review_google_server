const Sequelize = require("sequelize");

module.exports = class DeletionReport extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        reason: {
          type: Sequelize.STRING(300),
          allowNull: false,
        },
      },
      {
        sequelize,
        underscored: false,
        modelName: "DeletionReport",
        tableName: "deletionReports",
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }

  static associate(db) {
    db.DeletionReport.belongsTo(db.Subject);
  }
};
