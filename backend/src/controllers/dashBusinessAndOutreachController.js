const {
  addBusinessService,
  removeBusinessesFromDashboardService,
  getDashboardBusinessesService,
  fetchBusinessesOutreachStatusService,
  getUserFollowUpsService,
} = require("../services/dashBusinessAndOutreachService");

const addBusinessController = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const businessData = req.body;

    console.log("Received businessData at controller:", businessData);
    if (
      !userId ||
      !businessData ||
      !businessData.name ||
      !businessData.address ||
      !businessData.niche
    ) {
      return res.status(400).json({
        error: "Missing required fields: userId, name, address, or niche.",
      });
    }

    const result = await addBusinessService(req, userId, businessData);

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in addBusinessController:", error);
    res.status(500).json({ error: "Failed to add business and related data." });
  }
};

const removeBusinessesFromDashboardController = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { businessIds } = req.body;

    if (!userId || !Array.isArray(businessIds) || businessIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Missing userId or businessIds array.",
      });
    }

    const result = await removeBusinessesFromDashboardService(
      userId,
      businessIds
    );

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(207).json(result); // 207: Multi-Status (some failed)
    }
  } catch (error) {
    console.error("Error in removeBusinessesFromDashboardController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove businesses from dashboard.",
    });
  }
};

const getDashboardBusinessesController = async (req, res) => {
  try {
    const userId = req.user?.userId; // Adjust as needed based on your auth middleware
    const filters = req.query || {};

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required to fetch dashboard businesses.",
      });
    }

    const businesses = await getDashboardBusinessesService(userId, filters);

    return res.status(200).json({
      success: true,
      data: businesses,
    });
  } catch (error) {
    console.error("Error in getDashboardBusinessesController:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard businesses.",
    });
  }
};

const getOutreachBusinessesController = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const businesses = await fetchBusinessesOutreachStatusService(userId);
    res.status(200).json({ success: true, data: businesses });
  } catch (error) {
    console.error(
      "[OutreachController] Error in getOutreachBusinesses:",
      error
    );
    res.status(500).json({ success: false, error: "Internal server error." });
  }
};

const getUserFollowUpsController = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ error: "User ID is missing." });
    }

    const followUps = await getUserFollowUpsService(userId);
    res.status(200).json(followUps);
  } catch (error) {
    console.error(
      "[FollowUpController] Error in getUserFollowUpsController:",
      error
    );
    res.status(500).json({ error: "Failed to fetch follow-up data." });
  }
};

module.exports = {
  addBusinessController,
  removeBusinessesFromDashboardController,
  getDashboardBusinessesController,
  getOutreachBusinessesController,
  getUserFollowUpsController,
};
