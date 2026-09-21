const express = require("express");
const { login } = require("../controllers/authController");
const { loginValidation } = require("../middleware/validationMiddleware");
const { loginRateLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

router.post(
  "/login",
  loginRateLimiter,
  loginValidation,
  login
);

module.exports = router;