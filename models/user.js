const Sequelize = require("sequelize");

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        name: {
          type: Sequelize.STRING(15),
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING(30),
          allowNull: false,
          unique: true,
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        birth: {
          type: Sequelize.STRING(10), // yyyy-MM-dd
          allowNull: false,
        },
      },
      {
        sequelize,
        underscored: false,
        modelName: "User",
        tableName: "users",
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }

  static associate(db) {
    db.User.hasMany(db.Review);
    db.User.belongsToMany(db.Review, {
      foreignKey: "GoodMarkUserId",
      as: "GoodMarkedReviews",
      through: "Good",
    });
    db.User.belongsToMany(db.Review, {
      foreignKey: "BadMarkUserId",
      as: "BadMarkedReviews",
      through: "Bad",
    });
  }
};
