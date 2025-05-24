const pool = require("../db");

const getWebsiteByBusinessId = async (businessId) => {
  try {
    const query = `SELECT website FROM businesses WHERE businessid = $1 LIMIT 1`;
    const values = [businessId];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null; // No such business found
    }

    const website = result.rows[0].website;
    return website || null; // Return null if it's empty
  } catch (error) {
    console.error("Error in getWebsiteByBusinessId:", error);
    throw error;
  }
};

async function saveScrapedData(
  businessId,
  website,
  emails,
  socialMediaLinks,
  directoryLinks,
  logo_url,
  service_images
) {
  try {
    // Step 1: Check if data already exists
    const checkQuery = `
      SELECT info_id FROM business_info
      WHERE business_id = $1
    `;
    const checkResult = await pool.query(checkQuery, [businessId]);

    // Step 2: Prepare values
    const preparedEmails = emails?.length > 0 ? JSON.stringify(emails) : null;
    const preparedSocialMediaLinks =
      socialMediaLinks && Object.keys(socialMediaLinks).length > 0
        ? JSON.stringify(socialMediaLinks)
        : null;
    const preparedDirectoryLinks =
      directoryLinks && Object.keys(directoryLinks).length > 0
        ? JSON.stringify(directoryLinks)
        : null;
    const preparedLogoUrl = logo_url || null;
    const preparedServiceImages =
      service_images?.length > 0 ? JSON.stringify(service_images) : null;

    // Step 3: Determine scraping status
    const isDataFound =
      preparedEmails ||
      preparedSocialMediaLinks ||
      preparedDirectoryLinks ||
      preparedLogoUrl ||
      preparedServiceImages;

    const scrapingStatus = isDataFound ? "completed" : "empty";

    if (checkResult.rowCount > 0) {
      console.log("Existing entry found, updating...");

      // Step 4: Update existing entry
      const updateQuery = `
        UPDATE business_info
        SET website = $2,
            email = $3,
            social_media = $4,
            directories = $5,
            logo_url = $6,
            service_images = $7,
            scraping_status = $8
        WHERE business_id = $1
      `;
      await pool.query(updateQuery, [
        businessId,
        website,
        preparedEmails,
        preparedSocialMediaLinks,
        preparedDirectoryLinks,
        preparedLogoUrl,
        preparedServiceImages,
        scrapingStatus,
      ]);
      console.log(`Updated scraped data for business ID: ${businessId}`);
    } else {
      console.log("No existing entry, inserting new data...");

      // Step 5: Insert new entry
      const insertQuery = `
        INSERT INTO business_info (
          business_id,
          website,
          email,
          social_media,
          directories,
          logo_url,
          service_images,
          scraping_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      await pool.query(insertQuery, [
        businessId,
        website,
        preparedEmails,
        preparedSocialMediaLinks,
        preparedDirectoryLinks,
        preparedLogoUrl,
        preparedServiceImages,
        scrapingStatus,
      ]);
      console.log(`Inserted scraped data for business ID: ${businessId}`);
    }
  } catch (err) {
    console.error(
      "Error while saving scraped data for business ID:",
      businessId
    );
    console.error("Error Message:", err.message);
  }
  console.log("Finished saveScrapedData()\n");
}

const setScrapingStatus = async (businessId, status) => {
  try {
    const updateStatusQuery = `
      UPDATE business_info
      SET scraping_status = $1
      WHERE business_id = $2
    `;
    await pool.query(updateStatusQuery, [status, businessId]);
    console.log(
      `Updated scraping status to '${status}' for business ID: ${businessId}`
    );
  } catch (err) {
    console.error("Error while updating scraping status:", err.message);
  }
};

const getScrapedDataByBusinessId = async (businessId) => {
  const query = `
    SELECT website, email, social_media, directories, logo_url, service_images, scraping_status
    FROM business_info
    WHERE business_id = $1
    LIMIT 1
  `;
  const result = await pool.query(query, [businessId]);
  return result.rows[0] || null;
};

async function getScrapeStatusByBusinessId(businessId) {
  const query = `
    SELECT scraping_status
    FROM business_info
    WHERE business_id = $1
    LIMIT 1
  `;
  const result = await pool.query(query, [businessId]);
  return result.rows[0]?.scraping_status || null;
}

module.exports = {
  getScrapedDataByBusinessId,
  getScrapeStatusByBusinessId,
  getWebsiteByBusinessId,
  saveScrapedData,
  setScrapingStatus,
};
