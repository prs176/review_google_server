const { ModificationReport, ReduplicationReport, DeletionReport } = require("../models");
const express = require("express");
const cors = require("cors");

const router = express.Router();

router.use(cors({ credentials: true }));

router.post("/reduplication/:subjectId", async (req, res, next) => {
  try {
    await ReduplicationReport.create({ SubjectId: req.params.subjectId, url: req.body.url });
    res.json({
      code: 201,
      message: "수정이 요청되었습니다.",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/modification/:subjectId", async (req, res, next) => {
  try {
    await ModificationReport.create({
      SubjectId: req.params.subjectId,
      image: req.body.image,
      category: req.body.category,
      title: req.body.title,
      from: req.body.from,
    });
    res.json({
      code: 201,
      message: "수정이 요청되었습니다.",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/deletion/:subjectId", async (req, res, next) => {
  try {
    await DeletionReport.create({ SubjectId: req.params.subjectId, reason: req.body.reason });
    res.json({
      code: 201,
      message: "수정이 요청되었습니다.",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
