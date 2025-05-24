const {
  upsertBusinesses,
  insertUserSearch,
  getCompetitorsByDistance,
} = require("../models/businessModel");
const {
  // updateBusinessLocation,
  insertBusinessWithInfo,
} = require("../models/addBusinessModel");
const {
  removeBusinessFromDashboard,
  getFilteredBusinesses,
  getAllUserBusinesses,
  getBusinessesOutreachStatus,
  getFollowUpsForUser,
} = require("../models/dashBusinessAndOutreachModel");

const apicall = require("../utils/apiUtils");

const addBusinessService = async (req, userId, businessData) => {
  const { name, address, niche, ...businessInfoFields } = businessData;

  // STEP 1: Insert user's business into businesses (+ optional business_info)
  const insertedBusiness = await insertBusinessWithInfo(userId, {
    name,
    address,
    phonenumbers: businessInfoFields.phonenumbers,
    website: businessInfoFields.website,
    category: businessInfoFields.category,
    niche,
    email: businessInfoFields.email,
    social_links: businessInfoFields.social_media,
  });

  if (!insertedBusiness || !insertedBusiness.businessid) {
    throw new Error("Failed to insert user business");
  }

  const businessId = insertedBusiness.businessid;

  // STEP 2: Call fetchBusinesses (includes geocoding + Google Places APIs)
  const fetchedBusinesses = await apicall.fetchBusinesses(
    req,
    niche,
    address,
    8000
  );

  const businesses = fetchedBusinesses;
  const keyword = niche;

  // Upsert businesses
  const upsertedBusinesses = await upsertBusinesses(businesses, keyword);

  // Extract IDs (non-null/undefined)
  const businessIds = upsertedBusinesses
    .map((b) => b.businessid)
    .filter(Boolean);

  if (businessIds.length === 0) {
    console.error(
      "Business IDs array is empty after upsert. Check upsertBusinesses logic."
    );
    throw new Error("Business IDs must be a valid non-empty array.");
  }

  // Insert user search entry
  const location = address;
  await insertUserSearch(userId, keyword, location, businessIds);

  await getCompetitorsByDistance(userId);

  return {
    message: "Business and related data inserted successfully",
    businessId,
    totalBusinesses: businessIds.length,
  };
};

const removeBusinessesFromDashboardService = async (userId, businessIds) => {
  try {
    console.log(
      `[RemoveDashboardService] Removing businesses from dashboard for userId: ${userId}`
    );
    console.log(
      "[RemoveDashboardService] Business IDs to remove:",
      businessIds
    );

    const deletionPromises = businessIds.map((businessId) => {
      console.log(
        `[RemoveDashboardService] Scheduling deletion for businessId: ${businessId}`
      );
      return removeBusinessFromDashboard(userId, businessId);
    });

    const results = await Promise.all(deletionPromises);

    results.forEach((result, index) => {
      const bizId = businessIds[index];
      if (result.success) {
        console.log(
          `[RemoveDashboardService] Successfully removed businessId: ${bizId}`
        );
      } else {
        console.warn(
          `[RemoveDashboardService] Failed to remove businessId: ${bizId}`
        );
      }
    });

    const success = results.every((result) => result.success);

    if (success) {
      console.log(
        `[RemoveDashboardService] All ${businessIds.length} businesses removed successfully.`
      );
      return { success: true, message: "Businesses removed from dashboard." };
    } else {
      console.warn(
        "[RemoveDashboardService] Some businesses could not be removed."
      );
      return {
        success: false,
        message: "Some businesses could not be removed.",
      };
    }
  } catch (error) {
    console.error(
      "[RemoveDashboardService] Error removing businesses from dashboard:",
      error
    );
    throw error;
  }
};

const getDashboardBusinessesService = async (userId, filters = {}) => {
  try {
    console.log(
      `[DashboardService] Fetching dashboard businesses for userId: ${userId}`
    );
    console.log("[DashboardService] Received filters:", filters);

    const hasActiveFilters = Object.keys(filters).some(
      (key) => filters[key] !== undefined && filters[key] !== ""
    );

    console.log(`[DashboardService] Filters active: ${hasActiveFilters}`);

    let businesses;

    if (hasActiveFilters) {
      console.log(
        "[DashboardService] Running getFilteredBusinesses with filters..."
      );
      businesses = await getFilteredBusinesses(filters, userId);
    } else {
      console.log(
        "[DashboardService] No filters applied. Fetching all businesses..."
      );
      businesses = await getAllUserBusinesses(userId);
    }

    console.log(
      `[DashboardService] Found ${businesses.length} business(es) for userId: ${userId}`
    );
    return businesses;
  } catch (error) {
    console.error(
      "[DashboardService] Error in getDashboardBusinessesService:",
      error
    );
    throw error;
  }
};

const fetchBusinessesOutreachStatusService = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required to fetch outreach status.");
    }

    const businesses = await getBusinessesOutreachStatus(userId);
    return businesses;
  } catch (error) {
    console.error(
      "[OutreachService] Error in fetchBusinessesOutreachStatus:",
      error
    );
    throw error;
  }
};

const getUserFollowUpsService = async (userId) => {
  try {
    const followUps = await getFollowUpsForUser(userId);
    return followUps;
  } catch (error) {
    console.error("[FollowUpService] Error in getUserFollowUps:", error);
    throw error;
  }
};

module.exports = {
  addBusinessService,
  removeBusinessesFromDashboardService,
  getDashboardBusinessesService,
  fetchBusinessesOutreachStatusService,
  getUserFollowUpsService,
};
