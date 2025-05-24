const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
const {
  addOrUpdateGmailAccountService,
  fetchUserDashboardStatsService,
  removeGmailAccountService,
  getGmailAccountService,
} = require("../services/gmailAccountService");

async function addOrUpdateGmailAccountController(req, res) {
  const code = req.query.code;
  const stateToken = req.query.state;

  if (!code) {
    return res.status(400).send("Missing code");
  }

  if (!stateToken) {
    return res.status(400).send("Missing state token");
  }

  try {
    const decoded = jwt.verify(stateToken, process.env.JWT_SECRET);
    const userId = decoded.userId;

    if (!userId) {
      return res.status(401).send("Invalid token: missing userId.");
    }

    // 1) Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // 2) Get user info from Google
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const { email, name, picture } = userInfo.data;

    if (!email) {
      return res.status(400).send("Could not retrieve email from Google.");
    }

    // 3) Upsert via service
    await addOrUpdateGmailAccountService({
      userId,
      email,
      name,
      picture,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    res.redirect("http://localhost:5173/dashboard/Account");
  } catch (err) {
    console.error("OAuth callback error:", err);
    res.status(500).send("Authentication failed.");
  }
}

async function getDashboardStatsHandlerController(req, res) {
  const userId = req.user.userId;

  const result = await fetchUserDashboardStatsService(userId);

  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(500).json({ error: result.message });
  }
}

// Deactivate a Gmail account
async function deactivateGmailAccountController(req, res) {
  try {
    const userId = req.user.userId;
    const { email } = req.body;

    const account = await removeGmailAccountService(userId, email);
    res.status(200).json({ success: true, account });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// Get a specific Gmail account by email
async function getGmailAccountByEmailController(req, res) {
  try {
    const userId = req.user.userId;
    const { email } = req.params;

    const account = await getGmailAccountService(userId, email);
    res.status(200).json({ success: true, account });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

module.exports = {
  addOrUpdateGmailAccountController,
  getDashboardStatsHandlerController,
  deactivateGmailAccountController,
  getGmailAccountByEmailController,
};
