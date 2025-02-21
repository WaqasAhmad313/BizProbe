const express = require("express");
const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controllers/userController"); //  Import controller functions
const { authenticateUser } = require("../middleware/authMiddleware"); // Import Middleware

const router = express.Router();

router.post("/signup", registerUser); //  Correctly linked function
router.post("/login", loginUser);
// Protected Route (Example: User Profile)
router.get("/profile", authenticateUser, getProfile);

module.exports = router;
