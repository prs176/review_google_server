const express = require("express");
const cors = require("cors");
const path = require("path");
const index = path.resolve(__dirname, "../front/build/index.html");

const router = express.Router();

router.use(cors({ credentials: true }));

router.get("*", (req, res, next) => {
  res.sendFile(index);
});

module.exports = router;
