const gmailModel = require("../models/gmailAccountModel");

// Add or update a Gmail account
async function addOrUpdateGmailAccountService({
  userId,
  email,
  access_token,
  refresh_token,
  name,
  picture,
}) {
  if (!email || !access_token || !refresh_token) {
    throw new Error("Missing required Gmail account fields.");
  }

  return await gmailModel.upsertGmailAccount({
    userId,
    email,
    access_token,
    refresh_token,
    name,
    picture,
  });
}

async function fetchUserDashboardStatsService(userId) {
  try {
    const dashboardStats = await gmailModel.getUserDashboardStats(userId);
    return {
      success: true,
      data: dashboardStats,
    };
  } catch (error) {
    console.error("Error fetching user dashboard stats:", error);
    return {
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    };
  }
}

// Deactivate a Gmail account
async function removeGmailAccountService(userId, email) {
  if (!email || !userId) throw new Error("User ID and email are required.");
  return await gmailModel.deactivateGmailAccount(userId, email);
}

// Get Gmail account by email for the user (e.g., before sending)
async function getGmailAccountService(userId, email) {
  if (!email || !userId) throw new Error("User ID and email are required.");
  return await gmailModel.getGmailAccountByEmail(userId, email);
}

module.exports = {
  addOrUpdateGmailAccountService,
  fetchUserDashboardStatsService,
  removeGmailAccountService,
  getGmailAccountService,
};
