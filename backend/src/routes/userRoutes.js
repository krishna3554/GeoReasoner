const express = require("express");

const {
  getUsers,
  getUserById,
  updateUser,
  createUser,
} = require("../controllers/userController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");



const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getUsers
);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN"),
  createUser
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getUserById
);

router.patch(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  updateUser
);

module.exports = router;