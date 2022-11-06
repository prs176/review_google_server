const { User } = require("../models");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");

const { verifyToken } = require("./middlewares");

const router = express.Router();

router.use(cors({ credentials: true }));

router.post("/register", async (req, res, next) => {
  const { name, email, password, birth } = req.body;
  try {
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      name,
      email,
      password: hash,
      birth,
    });

    return res.status(201).json({ code: 201, message: "가입되었습니다." });
  } catch (err) {
    console.error(err);
    if (err.message === "Validation error") {
      err.status = 403;
      err.message = "이미 존재하는 아이디입니다.";
    }
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { email: req.body.email },
    });
    if (user) {
      const result = await bcrypt.compare(req.body.password, user.password);
      if (result) {
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: "24h",
          issuer: "review_google",
        });
        return res.json({
          code: 200,
          message: "토큰이 발급되었습니다.",
          response: token,
        });
      } else {
        return res.status(401).json({
          code: 401,
          message: "잘못된 비밀번호입니다.",
        });
      }
    } else {
      return res.status(401).json({
        code: 401,
        message: "가입되지 않은 이메일입니다.",
      });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/", verifyToken, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.decoded.id } });

    return res.status(200).json({
      code: 200,
      message: "사용자가 조회되었습니다.",
      response: {
        id: user.id,
        name: user.name,
        email: user.email,
        birth: user.birth,
      },
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
