const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!password)
      return res.status(400).json({ error: "Password is required" });

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert User into Database
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password, createdate) VALUES ($1, $2, $3, NOW()) RETURNING userid, name, email, createdate",
      [name, email, hashedPassword]
    );

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser.rows[0] });
  } catch (error) {
    console.error("Error in registerUser:", error);

    if (error.code === "23514") {
      return res.status(400).json({ error: "Invalid email format" });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!password)
      return res.status(400).json({ error: "Password is required" });

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ error: "Server misconfiguration: JWT_SECRET is missing" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user.rows[0].userid },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get User Profile
const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Invalid token payload" });
    }

    const userId = req.user.userId;

    const user = await pool.query(
      "SELECT userid, name, email, createdate FROM users WHERE userid = $1",
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Welcome to your profile!",
      user: user.rows[0],
    });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { registerUser, loginUser, getProfile };
