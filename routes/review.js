const { Review, Score, User, Keyword, Subject } = require("../models");
const express = require("express");
const cors = require("cors");

const { verifyToken, verifyOptionalToken } = require("./middlewares");

const router = express.Router();

router.use(cors({ credentials: true }));

router.get("/my", verifyToken, async (req, res, next) => {
  try {
    const reviewContents = await Review.findAll({
      where: {
        UserId: req.decoded.id,
      },
      include: [
        { model: User, attributes: ["id"], as: "GoodMarkUsers" },
        { model: User, attributes: ["id"], as: "BadMarkUsers" },
      ],
    });
    const reviews = await Promise.all(
      reviewContents.map(async (review) => {
        const scores = await Score.findAll({
          where: { ReviewId: review.id },
          attributes: ["score", "name"],
        });
        const user = await User.findOne({
          where: { id: review.UserId },
          attributes: ["id", "email"],
        });
        const subject = await Subject.findOne({
          where: { id: review.SubjectId },
          attributes: ["id", "image", "category", "title", "from"],
        });
        const count = await Review.count({ where: { SubjectId: review.SubjectId } });
        const good = review.GoodMarkUsers.length;
        const bad = review.BadMarkUsers.length;
        const isGood = review.GoodMarkUsers.map((user) => user.id).includes(
          parseInt(req.decoded.id, 10)
        );
        const isBad = review.BadMarkUsers.map((user) => user.id).includes(
          parseInt(req.decoded.id, 10)
        );

        return {
          id: review.id,
          title: review.title,
          content: review.content,
          raiting: review.raiting,
          scores,
          user,
          subject: {
            id: subject.id,
            image: subject.image,
            category: subject.category,
            title: subject.title,
            from: subject.from,
            count,
          },
          good,
          bad,
          isMine: true,
          isGood: isGood,
          isBad: isBad,
        };
      })
    );

    res.json({
      code: 200,
      message: "내가 쓴 리뷰가 조회되었습니다.",
      response: reviews,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/:subjectId", verifyOptionalToken, async (req, res, next) => {
  try {
    let reviewContents = await Review.findAll(
      req.query.sort === "recent"
        ? {
            where: {
              SubjectId: req.params.subjectId,
            },
            include: [
              { model: User, attributes: ["id", "name"], as: "GoodMarkUsers" },
              { model: User, attributes: ["id", "name"], as: "BadMarkUsers" },
            ],
            order: [["createdAt", "DESC"]],
          }
        : {
            where: {
              SubjectId: req.params.subjectId,
            },
            include: [
              { model: User, attributes: ["id", "name"], as: "GoodMarkUsers" },
              { model: User, attributes: ["id", "name"], as: "BadMarkUsers" },
            ],
          }
    );

    var reviews = await Promise.all(
      reviewContents.map(async (review) => {
        const scores = await Score.findAll({
          where: { ReviewId: review.id },
          attributes: ["score", "name"],
        });
        const user = await User.findOne({
          where: { id: review.UserId },
          attributes: ["id", "email"],
        });
        const good = review.GoodMarkUsers.length;
        const bad = review.BadMarkUsers.length;
        const isMine = req.decoded !== undefined && req.decoded.id === review.UserId;
        const isGood =
          req.decoded !== undefined &&
          review.GoodMarkUsers.map((user) => user.id).includes(parseInt(req.decoded.id, 10));
        const isBad =
          req.decoded !== undefined &&
          review.BadMarkUsers.map((user) => user.id).includes(parseInt(req.decoded.id, 10));

        return {
          id: review.id,
          title: review.title,
          content: review.content,
          raiting: review.raiting,
          scores,
          user,
          good,
          bad,
          isMine,
          isGood,
          isBad,
        };
      })
    );
    if (req.query.sort === "popular") {
      reviews = reviews
        .sort((review1, review2) => review2.good - review1.good)
        .map((review) => {
          return {
            id: review.id,
            title: review.title,
            content: review.content,
            raiting: review.raiting,
            scores: review.scores,
            user: review.user,
            good: review.good,
            bad: review.bad,
            isMine: review.isMine,
            isGood: review.isGood,
            isBad: review.isBad,
          };
        });
    }

    res.json({
      code: 200,
      message: "리뷰가 조회되었습니다.",
      response: reviews,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/", verifyToken, async (req, res, next) => {
  const { subjectId, title, content, raiting, scores, keywords } = req.body;
  try {
    const review = await Review.create({
      title,
      content,
      raiting,
      SubjectId: subjectId,
      UserId: req.decoded.id,
    });

    await Promise.all(
      scores.map(async (score) => {
        return await Score.create({
          SubjectId: subjectId,
          ReviewId: review.id,
          name: score.name,
          score: score.score,
        });
      })
    );

    await Promise.all(
      keywords.map(async (keyword) => {
        return await Keyword.create({
          SubjectId: subjectId,
          ReviewId: review.id,
          word: keyword.word,
          freq: keyword.freq,
        });
      })
    );

    res.json({
      code: 201,
      message: "리뷰가 생성되었습니다.",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/good/:id", verifyToken, async (req, res, next) => {
  try {
    const review = await Review.findOne({ where: { id: req.params.id } });
    if (review) {
      await review.addGoodMarkUsers(parseInt(req.decoded.id, 10));

      res.json({
        code: 201,
        message: "좋아요를 표시했습니다.",
      });
    } else {
      return res.status(404).json({
        code: 404,
        message: "존재하지 않는 리뷰입니다.",
      });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/notgood/:id", verifyToken, async (req, res, next) => {
  try {
    const review = await Review.findOne({ where: { id: req.params.id } });
    if (review) {
      await review.removeGoodMarkUsers(parseInt(req.decoded.id, 10));

      res.json({
        code: 201,
        message: "좋아요를 취소했습니다.",
      });
    } else {
      return res.status(404).json({
        code: 404,
        message: "존재하지 않는 리뷰입니다.",
      });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/bad/:id", verifyToken, async (req, res, next) => {
  try {
    const review = await Review.findOne({ where: { id: req.params.id } });
    if (review) {
      await review.addBadMarkUsers(parseInt(req.decoded.id, 10));

      res.json({
        code: 201,
        message: "싫어요를 표시했습니다.",
      });
    } else {
      return res.status(404).json({
        code: 404,
        message: "존재하지 않는 리뷰입니다.",
      });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/notbad/:id", verifyToken, async (req, res, next) => {
  try {
    const review = await Review.findOne({ where: { id: req.params.id } });
    if (review) {
      await review.removeBadMarkUsers(parseInt(req.decoded.id, 10));

      res.json({
        code: 201,
        message: "싫어요를 취소했습니다.",
      });
    } else {
      return res.status(404).json({
        code: 404,
        message: "존재하지 않는 리뷰입니다.",
      });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.put("/:id", verifyToken, async (req, res, next) => {
  const { title, content, raiting, scores, keywords } = req.body;
  try {
    const review = await Review.findOne({ where: { id: req.params.id } });
    if (review) {
      if (review.UserId === req.decoded.id) {
        await review.update({ title, content, raiting });

        await Score.destroy({ where: { ReviewId: review.id } });
        await Promise.all(
          scores.map(async (score) => {
            return await Score.create({
              ReviewId: review.id,
              SubjectId: review.SubjectId,
              name: score.name,
              score: score.score,
            });
          })
        );

        await Keyword.destroy({ where: { ReviewId: review.id } });
        await Promise.all(
          keywords.map(async (keyword) => {
            return await Keyword.create({
              ReviewId: review.id,
              SubjectId: review.SubjectId,
              word: keyword.word,
              freq: keyword.freq,
            });
          })
        );

        res.json({
          code: 201,
          message: "리뷰가 수정되었습니다.",
        });
      } else {
        return res.status(403).json({
          code: 403,
          message: "내 리뷰만 수정할 수 있습니다.",
        });
      }
    } else {
      return res.status(404).json({
        code: 404,
        message: "존재하지 않는 리뷰입니다.",
      });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const review = await Review.findOne({ where: { id: req.params.id } });
    if (review) {
      if (review.UserId === req.decoded.id) {
        await Score.destroy({ where: { reviewId: req.params.id } });
        await Keyword.destroy({ where: { reviewId: req.params.id } });
        await review.destroy();

        res.json({
          code: 201,
          message: "리뷰가 삭제되었습니다.",
        });
      } else {
        return res.status(403).json({
          code: 403,
          message: "내 리뷰만 삭제할 수 있습니다.",
        });
      }
    } else {
      return res.status(404).json({
        code: 404,
        message: "존재하지 않는 리뷰입니다.",
      });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
