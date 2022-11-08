const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const Keyword = require("./keyword");
const Review = require("./review");
const Score = require("./score");
const Subject = require("./subject");
const User = require("./user");
const ReduplicationReport = require("./reduplicationReport");
const ModificationReport = require("./modificationReport");
const DeletionReport = require("./deletionReport");

const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Keyword = Keyword;
db.Review = Review;
db.Score = Score;
db.Subject = Subject;
db.User = User;
db.ReduplicationReport = ReduplicationReport;
db.ModificationReport = ModificationReport;
db.DeletionReport = DeletionReport;

Keyword.init(sequelize);
Review.init(sequelize);
Score.init(sequelize);
Subject.init(sequelize);
User.init(sequelize);
ReduplicationReport.init(sequelize);
ModificationReport.init(sequelize);
DeletionReport.init(sequelize);

Keyword.associate(db);
Review.associate(db);
Score.associate(db);
Subject.associate(db);
User.associate(db);
ReduplicationReport.associate(db);
ModificationReport.associate(db);
DeletionReport.associate(db);

module.exports = db;
