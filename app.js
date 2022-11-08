const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();
const subjectRouter = require("./routes/subject");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");
const reportRouter = require("./routes/report");
const pageRouter = require("./routes/page");
const { sequelize } = require("./models");

const app = express();
app.set("port", process.env.PORT);
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });

try {
  fs.readdirSync("uploads");
} catch (err) {
  console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("uploads");
}

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "front/build")));
app.use("/image", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

app.use("/subject", subjectRouter);
app.use("/review", reviewRouter);
app.use("/user", userRouter);
app.use("/report", reportRouter);
app.use("/", pageRouter);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ code: err.status || 500, message: err.message });
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기중");
});
