const businessModel = require("../models/businessModel");
const apiUtils = require("../utils/apiUtils");
const {
  saveScrapedData,
  setScrapingStatus,
  getScrapedDataByBusinessId,
  getScrapeStatusByBusinessId,
} = require("../scraper/scrapperModel");
const { scrapeBusinessData } = require("../scraper/scrape");

const searchAndPrepareBusinessesService = async (
  req,
  keyword,
  location,
  radius
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error("User ID is missing in request.");
    }
    const businesses = await apiUtils.fetchBusinesses(
      req,
      keyword,
      location,
      radius
    );
    if (!businesses.length) return null;
    const businessIdMap = await businessModel.upsertBusinesses(
      businesses,
      keyword
    );
    const businessIds = Object.values(businessIdMap).filter(Boolean);
    if (businessIds.length === 0) {
      throw new Error("Business IDs must be a valid non-empty array.");
    }
    await businessModel.insertUserSearch(
      userId,
      keyword,
      location,
      businessIds
    );
    let competitorsResults = await businessModel.getCompetitorsByDistance(
      userId
    );

    if (!competitorsResults || typeof competitorsResults !== "object") {
      competitorsResults = {};
    }
    const mapData = await businessModel.getMapData(userId, competitorsResults);
    if (!mapData) {
      throw new Error("Map data is missing.");
    }
    const formatOpenHours = (hours) => {
      if (!Array.isArray(hours)) return {};

      let formatted = {};
      hours.forEach((entry) => {
        const [day, time] = entry.split(": ");
        if (day && time) {
          formatted[day.trim()] = time.trim();
        }
      });
      return formatted;
    };

    return {
      businesses: await businessModel.getAllBusinesses(userId),
      competitors: competitorsResults,
      mapData: mapData,
    };
  } catch (error) {
    console.error("Error in searchAndPrepareBusinessesService:", error);
    throw error;
  }
};

const getBusinessDetailsWithCompetitorsService = async (req, businessId) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new Error("User ID is missing in request.");
  }

  // Fetch core data
  const businessDetails = await businessModel.getBusinessDetailsLegacy(
    businessId
  );
  const competitorDetails = await businessModel.getCompetitorDetailsLegacy(
    businessId
  );
  const mapData = await businessModel.mapdataLegacy(businessId);

  // Try fetching already-scraped data (if it exists)
  const scrapedInfo = await getScrapedDataByBusinessId(businessId);

  // Start scraping in background if no data already
  if (
    !scrapedInfo ||
    scrapedInfo.scraping_status === "empty" ||
    scrapedInfo.scraping_status === "failed"
  ) {
    (async () => {
      try {
        await setScrapingStatus(businessId, "in_progress");

        const scrapedData = await scrapeBusinessData(businessDetails.website);

        if (scrapedData) {
          const {
            emails,
            socialMediaLinks,
            businessDirectories,
            website,
            logo_url,
            service_images,
          } = scrapedData;

          await saveScrapedData(
            businessId,
            website,
            emails,
            socialMediaLinks,
            businessDirectories,
            logo_url,
            service_images
          );
          await setScrapingStatus(businessId, "completed");
        } else {
          await setScrapingStatus(businessId, "empty");
        }
      } catch (err) {
        console.error("❌ Scraping error:", err.message);
        await setScrapingStatus(businessId, "failed");
      }
    })();
  }

  return {
    details: businessDetails,
    competitors: competitorDetails,
    mapData: mapData,
    scraped: scrapedInfo || null,
  };
};

async function checkScrapeStatus(businessId) {
  const status = await getScrapeStatusByBusinessId(businessId);
  return status || "pending"; // if no row exists yet
}
module.exports = {
  searchAndPrepareBusinessesService,
  getBusinessDetailsWithCompetitorsService,
  checkScrapeStatus,
};
