const { Subject, Review, Score, sequelize, Keyword } = require("../models");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const { verifyToken } = require("./middlewares");

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(cors({ credentials: true }));

router.get("/", async (req, res, next) => {
  try {
    const subjectContents = await Subject.findAll();
    const subjects = await Promise.all(
      subjectContents.map(async (subject) => {
        const count = await Review.count({ where: { SubjectId: subject.id } });
        return {
          id: subject.id,
          image: subject.image,
          category: subject.category,
          title: subject.title,
          from: subject.from,
          count: count,
        };
      })
    );

    res.json({
      code: 200,
      message: "주제가 조회되었습니다.",
      response: subjects,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/detail/:id", async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ where: { id: req.params.id } });
    if (subject) {
      const count = await Review.count({ where: { SubjectId: req.params.id } });
      const raiting = await Review.findOne({
        where: { SubjectId: req.params.id },
        attributes: [[sequelize.fn("avg", sequelize.col("raiting")), "raiting"]],
      });
      const scores = await Score.findAll({
        where: { SubjectId: req.params.id },
        attributes: ["name", [sequelize.fn("avg", sequelize.col("score")), "score"]],
        group: ["name"],
      });
      const keywords = await Keyword.findAll({
        where: { SubjectId: req.params.id },
        attributes: ["word", "freq"],
      });

      res.json({
        code: 200,
        message: "주제가 조회되었습니다.",
        response: {
          subject: {
            id: subject.id,
            image: subject.image,
            category: subject.category,
            title: subject.title,
            from: subject.from,
            count: count,
          },
          raiting: raiting.raiting,
          scores,
          keywords,
        },
      });
    } else {
      return res.status(404).json({
        code: 404,
        message: "존재하지 않는 주제입니다.",
      });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/:keyword", async (req, res, next) => {
  try {
    const subjectContents = await Subject.findAll({
      where: {
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${req.params.keyword}%`,
            },
          },
          {
            from: {
              [Op.like]: `%${req.params.keyword}%`,
            },
          },
        ],
      },
    });
    const subjects = await Promise.all(
      subjectContents.map(async (subject) => {
        const count = await Review.count({ where: { SubjectId: subject.id } });
        return {
          id: subject.id,
          image: subject.image,
          category: subject.category,
          title: subject.title,
          from: subject.from,
          count: count,
        };
      })
    );

    res.json({
      code: 200,
      message: "주제가 조회되었습니다.",
      response: subjects,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/image", verifyToken, upload.single("image"), (req, res) => {
  res.json({
    code: 201,
    message: "이미지가 업로드되었습니다.",
    response: { url: `/image/${req.file.filename}` },
  });
});

router.post("/", verifyToken, async (req, res, next) => {
  const { image, category, title, from } = req.body;
  try {
    const subject = await Subject.create({
      image,
      category,
      title,
      from,
    });

    res.status(201).json({
      code: 201,
      message: "주제가 생성되었습니다.",
    });
  } catch (err) {
    console.error(err);
    if (err.message === "Validation error") {
      err.status = 403;
      err.message = "이미 존재하는 주제입니다.";
    }
    next(err);
  }
});

module.exports = router;
