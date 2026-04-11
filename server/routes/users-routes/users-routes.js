const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getMyProfile
} = require("../../controllers/users-controller/users-controller");

const authenticateMiddleware = require("../../middleware/auth-middleware");
const authorizeRoles = require("../../middleware/role-middleware");
const { updateUser: updateUserValidation } = require("../../validations/user");

// Get current user profile
router.get("/me", authenticateMiddleware, getMyProfile);

// List all users (Admin only)
router.get("/", authenticateMiddleware, authorizeRoles('admin'), getUsers);

// Get single user
router.get("/:id", authenticateMiddleware, getUserById);

// Edit user
router.put("/:id", authenticateMiddleware, ...updateUserValidation, updateUser);

// “Soft” delete user (Admin only)
router.delete("/:id", authenticateMiddleware, authorizeRoles('admin'), deleteUser);

module.exports = router;
