const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  try {
    // Get Token from Headers
    const token = req.header("Authorization");

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    // Ensure JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ error: "Server misconfiguration: JWT_SECRET is missing" });
    }

    // Verify Token
    const tokenWithoutBearer = token.replace("Bearer ", "");
    const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);

    req.user = decoded; // Attach user info to request

    next(); // Continue to the next middleware
  } catch (error) {
    console.error("Token verification failed:", error.message);

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Session expired. Please log in again." });
    } else if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Invalid token. Please log in again." });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { authenticateUser };
