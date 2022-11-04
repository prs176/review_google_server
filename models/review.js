const Sequelize = require("sequelize");

module.exports = class Review extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        title: {
          type: Sequelize.STRING(30),
          allowNull: false,
        },
        content: {
          type: Sequelize.STRING(300),
          allowNull: false,
        },
        raiting: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        underscored: false,
        modelName: "Review",
        tableName: "reviews",
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }

  static associate(db) {
    db.Review.hasMany(db.Score);
    db.Review.hasMany(db.Keyword);
    db.Review.belongsTo(db.User);
    db.Review.belongsTo(db.Subject);
    db.Review.belongsToMany(db.User, {
      foreignKey: "GoodMarkedReviewId",
      as: "GoodMarkUsers",
      through: "Good",
    });
    db.Review.belongsToMany(db.User, {
      foreignKey: "BadMarkedReviewId",
      as: "BadMarkUsers",
      through: "Bad",
    });
  }
};
