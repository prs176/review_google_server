const Sequelize = require("sequelize");

module.exports = class Score extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        name: {
          type: Sequelize.STRING(30),
          allowNull: false,
        },
        score: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        underscored: false,
        modelName: "Score",
        tableName: "scores",
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }

  static associate(db) {
    db.Score.belongsTo(db.Review);
    db.Keyword.belongsTo(db.Subject);
  }
};
