const Sequelize = require("sequelize");

module.exports = class Keyword extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        word: {
          type: Sequelize.STRING(30),
          allowNull: false,
        },
        freq: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        underscored: false,
        modelName: "Keyword",
        tableName: "keywords",
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }

  static associate(db) {
    db.Keyword.belongsTo(db.Review);
    db.Keyword.belongsTo(db.Subject);
  }
};
