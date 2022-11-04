const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    if (req.headers.authorization) {
      req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
      return next();
    } else {
      return res.status(401).json({ code: 401, message: "로그인이 필요한 서비스입니다." });
    }
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(419).json({ code: 419, message: "토큰이 만료되었습니다." });
    }
    return res.status(401).json({ code: 401, message: "유효하지 않은 토큰입니다." });
  }
};

exports.verifyOptionalToken = (req, res, next) => {
  try {
    req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    return next();
  } catch (err) {
    return next();
  }
};
