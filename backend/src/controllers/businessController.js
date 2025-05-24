const businessService = require("../services/businessService");
//const apiUtils = require("../utils/apiUtils");

const searchAndPrepareBusinessesController = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { keyword, location, radius } = req.body;

    if (!userId || !keyword || !location || !radius) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const data = await businessService.searchAndPrepareBusinessesService(
      req,
      keyword,
      location,
      radius
    );

    if (!data) {
      return res.status(404).json({ error: "No businesses found" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Error in searchAndPrepareBusinessesController:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getBusinessDetailsWithCompetitorsController = async (req, res) => {
  try {
    let { businessId } = req.params;

    if (!businessId) {
      return res
        .status(400)
        .json({ error: "Missing required businessId parameter." });
    }

    const data = await businessService.getBusinessDetailsWithCompetitorsService(
      req,
      businessId
    );

    // Extract scraping status directly
    const scrapingStatus = data.scraped?.scraping_status || "not_started";

    return res.status(200).json({
      details: data.details,
      competitors: data.competitors,
      mapData: data.mapData,
      scraped: data.scraped || null,
      scraping_status: scrapingStatus, // Helps frontend easily check
    });
  } catch (error) {
    console.error(
      "Error in getBusinessDetailsWithCompetitorsController:",
      error
    );
    return res.status(500).json({ error: "Internal server error" });
  }
};

async function getScrapeStatus(req, res) {
  try {
    const { businessId } = req.params;
    const status = await businessService.checkScrapeStatus(businessId);
    res.json({ scraping_status: status });
  } catch (error) {
    console.error("Error getting scrape status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  searchAndPrepareBusinessesController,
  getBusinessDetailsWithCompetitorsController,
  getScrapeStatus,
};
