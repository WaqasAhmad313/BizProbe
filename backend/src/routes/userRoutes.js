const express = require("express");
const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controllers/userController");
const authenticateUser = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/profile", authenticateUser, getProfile);

module.exports = router;
