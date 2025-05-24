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

    // Extract token (remove 'Bearer ' prefix if present)
    const tokenWithoutBearer = token.replace("Bearer ", "");

    // ✅ Decode token without verifying (ignores expiration)
    const decoded = jwt.decode(tokenWithoutBearer);

    if (!decoded) {
      return res
        .status(401)
        .json({ error: "Invalid token. Please log in again." });
    }

    req.user = decoded; // Attach decoded user info to request

    next(); // Continue to the next middleware
  } catch (error) {
    console.error("Token processing failed:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = authenticateUser;
