const express = require("express");
const router = express.Router();
const { google } = require("googleapis");
const {
  addOrUpdateGmailAccountController,
  getDashboardStatsHandlerController,
  deactivateGmailAccountController,
  getGmailAccountByEmailController,
} = require("../controllers/gmailAccountsController");
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
const authenticateUser = require("../middleware/authMiddleware");

router.get("/gmail", authenticateUser, getDashboardStatsHandlerController);
router.delete("/gmail", authenticateUser, deactivateGmailAccountController);
router.get("/gmail/:email", authenticateUser, getGmailAccountByEmailController);

// Step 1: Start OAuth flow
router.get("/auth/google", (req, res) => {
  console.log("Auth backend endpoint is hit");

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    state: token,
  });

  console.log("Generated OAuth URL:", url);
  res.json({ url });
});

// Step 2: Handle OAuth callback
router.get("/auth/google/callback", addOrUpdateGmailAccountController);

// Optional: Test send route for dev
router.post("/send", async (req, res) => {
  const { access_token } = req.body;
  if (!access_token) {
    return res.status(400).json({ message: "Missing access token" });
  }

  try {
    oauth2Client.setCredentials({ access_token });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const subjectEncoded = `=?UTF-8?B?${Buffer.from(req.body.subject).toString(
      "base64"
    )}?=`;
    const rawMessage = Buffer.from(
      `To: ${req.body.to}\r\n` +
        `Subject: ${subjectEncoded}\r\n` +
        `MIME-Version: 1.0\r\n` +
        `Content-Type: text/html; charset=UTF-8\r\n\r\n` +
        `${req.body.body}`
    )
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: rawMessage,
      },
    });

    res.status(200).json({ message: "Email sent!", data: response.data });
  } catch (err) {
    console.error("Email send failed:", err);
    res
      .status(500)
      .json({ message: "Failed to send email", error: err.message });
  }
});

module.exports = router;
