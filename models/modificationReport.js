const Sequelize = require("sequelize");

module.exports = class ModificationReport extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        image: {
          type: Sequelize.STRING(300),
          allowNull: false,
        },
        category: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        title: {
          type: Sequelize.STRING(30),
          allowNull: false,
        },
        from: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
      },
      {
        sequelize,
        underscored: false,
        modelName: "ModificationReport",
        tableName: "modificationReports",
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }

  static associate(db) {
    db.ModificationReport.belongsTo(db.Subject);
  }
};
