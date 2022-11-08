const Sequelize = require("sequelize");

module.exports = class ReduplicationReport extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        url: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
      },
      {
        sequelize,
        underscored: false,
        modelName: "ReduplicationReport",
        tableName: "reduplicationReports",
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }

  static associate(db) {
    db.ReduplicationReport.belongsTo(db.Subject);
  }
};
