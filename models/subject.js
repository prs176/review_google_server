const Sequelize = require("sequelize");

module.exports = class Subject extends Sequelize.Model {
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
          unique: true,
        },
        from: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
      },
      {
        sequelize,
        underscored: false,
        modelName: "Subject",
        tableName: "subjects",
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }

  static associate(db) {
    db.Subject.hasMany(db.Review);
    db.Subject.hasMany(db.Score);
    db.Subject.hasMany(db.Keyword);
  }
};
