const pool = require("../db");

const getAllBusinesses = async (userId) => {
  const query = `
    SELECT b.*
    FROM businesses b
    JOIN (
      SELECT jsonb_array_elements_text(usb.business_ids) AS businessid
      FROM user_searched_businesses usb
      WHERE usb.user_id = $1
      AND usb.search_date = (
        SELECT MAX(search_date) 
        FROM user_searched_businesses 
        WHERE user_id = $1
      )
    ) subquery ON b.businessid = subquery.businessid
    ORDER BY b.rating DESC NULLS LAST, b.businessid;
  `;

  const values = [userId];

  return (await pool.query(query, values)).rows;
};

const getBusinessDetailsLegacy = async (businessId) => {
  console.log(`Model: Executing query for businessId: ${businessId}`);
  console.log(`Model: Type of businessId: ${typeof businessId}`);

  const result = await pool.query(
    `
    SELECT 
      b.name,
      b.phonenumbers AS phone_number,
      b.website,
      b.address,
      b.profileurl,
      b.category,
      b.rating,
      b.reviewscount AS reviews_count,
      b.status,
      b.opening_hours,
      b.reviews
    FROM businesses b
    WHERE b.businessid = $1;
  `,
    [businessId]
  );

  console.log("Model: Query executed successfully");
  console.log("Model: Query result:", result.rows);

  return result.rows.length > 0 ? result.rows[0] : null;
};

const getCompetitorDetailsLegacy = async (businessId) => {
  // Log the type and value of businessId
  console.log(
    `Model: Executing getCompetitorDetailsLegacy for businessId: ${businessId}`
  );
  console.log(`Model: Type of businessId: ${typeof businessId}`);

  // Step 1: Fetch competitors from the competitors table based on businessId
  console.log("Model: Fetching competitors from the competitors table...");
  const competitorsQuery = `
    SELECT 
      competitor_1,
      competitor_2,
      competitor_3
    FROM competitors
    WHERE business_id = $1
  `;

  const competitorsResult = await pool.query(competitorsQuery, [businessId]);

  // Log the competitors result
  console.log("Model: Competitors fetched:", competitorsResult.rows);

  if (competitorsResult.rows.length === 0) {
    console.log("Model: No competitors found.");
    return [];
  }

  // Extract competitors data
  const competitorsData = [
    competitorsResult.rows[0].competitor_1,
    competitorsResult.rows[0].competitor_2,
    competitorsResult.rows[0].competitor_3,
  ];

  // Step 2: Fetch details for each competitor from the businesses table
  const competitorIds = competitorsData.map(
    (competitor) => competitor.businessid
  );
  console.log("Model: Extracted competitor business IDs:", competitorIds);

  const detailsQuery = `
    SELECT  
      businessid,
      name, 
      status,
      address,
      phonenumbers AS phone_number, 
      website,
      rating, 
      reviewscount AS reviews_count,  
      category
    FROM businesses
    WHERE businessid = ANY($1)
  `;

  console.log(
    "Model: Executing details query with competitorIds:",
    competitorIds
  );

  const result = await pool.query(detailsQuery, [competitorIds]);

  // Log the result of the competitor details query
  console.log("Model: Competitor details query result:", result.rows);

  // Step 3: Merge details with the competitor data
  const competitorDetails = result.rows.map((comp) => {
    const competitorData = competitorsData.find(
      (c) => c.businessid === comp.businessid
    );

    // Log merged competitor details
    console.log(
      "Model: Merging details with stored competitor data for:",
      comp.businessid
    );

    return {
      ...comp,
      distance_m: competitorData?.distance_m || null,
      distance_km: competitorData?.distance_km || null,
    };
  });

  // Log the final competitor details
  console.log("Model: Final competitor details:", competitorDetails);

  return competitorDetails;
};

const mapdataLegacy = async (businessId) => {
  try {
    console.log(`Model: Executing mapdataLegacy for businessId: ${businessId}`);
    const businessQuery = `
      SELECT name, location
      FROM businesses
      WHERE businessid = $1
    `;
    const businessResult = await pool.query(businessQuery, [businessId]);
    const business = businessResult.rows[0];

    if (!business) {
      console.log(`Model: No business found with businessId: ${businessId}`);
      return null;
    }
    const businessData = {
      name: business.name,
      location: business.location,
    };
    const competitorsQuery = `
      SELECT competitor_1, competitor_2, competitor_3
      FROM competitors
      WHERE business_id = $1
    `;
    const competitorsResult = await pool.query(competitorsQuery, [businessId]);
    if (competitorsResult.rows.length === 0) {
      console.log("Model: No competitors found.");
      return null;
    }
    const competitorsData = [
      competitorsResult.rows[0].competitor_1,
      competitorsResult.rows[0].competitor_2,
      competitorsResult.rows[0].competitor_3,
    ];
    const competitorDetails = competitorsData.map((comp) => ({
      name: comp.name,
      location: comp.location,
      distance: comp.distance_km,
    }));
    return {
      business: businessData,
      competitors: competitorDetails,
    };
  } catch (error) {
    console.error(`Error in mapdataLegacy: ${error.message}`);
    throw error;
  }
};

const getCompetitorsByDistance = async (userId) => {
  const competitorsQuery = `
      WITH LatestSearch AS (
          SELECT business_ids
          FROM user_searched_businesses
          WHERE user_id = $1 
          ORDER BY search_date DESC
          LIMIT 1
      ),
      SearchedBusinesses AS (
          SELECT jsonb_array_elements_text(business_ids) AS searched_business_id
          FROM LatestSearch
      ),
      TargetBusinesses AS (
          SELECT
              b.businessid AS target_businessid,
              b.location AS target_location_json,
              ST_Transform(ST_SetSRID(ST_MakePoint((b.location->>'lng')::float, (b.location->>'lat')::float), 4326), 3857) AS target_location_geom
          FROM businesses b
          JOIN SearchedBusinesses sb ON b.businessid = sb.searched_business_id
      ),
      Competitors AS (
          SELECT
              t.target_businessid,
              b.businessid AS competitor_businessid,
              b.name AS competitor_name,
              b.location AS competitor_location_json,
              ST_Transform(ST_SetSRID(ST_MakePoint((b.location->>'lng')::float, (b.location->>'lat')::float), 4326), 3857) AS competitor_location_geom,
              t.target_location_geom
          FROM TargetBusinesses t
          CROSS JOIN businesses b
          WHERE b.businessid != t.target_businessid
          AND b.businessid IN (SELECT searched_business_id FROM SearchedBusinesses)
      ),
      Distances AS (
          SELECT
              c.target_businessid,
              c.competitor_businessid,
              c.competitor_name,
              c.competitor_location_json,
              ST_Distance(c.target_location_geom, c.competitor_location_geom) AS distance_m
          FROM Competitors c
      ),
      RankedCompetitors AS (
          SELECT
              target_businessid,
              competitor_businessid,
              competitor_name,
              competitor_location_json,
              distance_m,
              (distance_m / 1000) AS distance_km,
              ROW_NUMBER() OVER (PARTITION BY target_businessid ORDER BY distance_m) AS rn
          FROM Distances
      )
      SELECT
          target_businessid,
          competitor_businessid,
          competitor_name,
          competitor_location_json,
          distance_m,
          distance_km
      FROM RankedCompetitors
      WHERE rn <= 3
      ORDER BY target_businessid, distance_m;
  `;

  const result = await pool.query(competitorsQuery, [userId]);

  // Step 2: Format the result to match the expected structure
  let formattedResults = {};
  result.rows.forEach((row) => {
    const targetId = row.target_businessid;
    if (!formattedResults[targetId]) {
      formattedResults[targetId] = [];
    }
    formattedResults[targetId].push({
      businessid: row.competitor_businessid,
      name: row.competitor_name,
      location: row.competitor_location_json,
      distance_m: row.distance_m,
      distance_km: row.distance_km,
    });
  });
  console.log("Competitors data format:", formattedResults);

  // Step 3: Store competitors in DB
  for (const [businessId, competitors] of Object.entries(formattedResults)) {
    const comp1 = competitors[0] || null;
    const comp2 = competitors[1] || null;
    const comp3 = competitors[2] || null;

    const insertQuery = `
      INSERT INTO competitors (business_id, competitor_1, competitor_2, competitor_3)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (business_id) DO UPDATE
      SET competitor_1 = EXCLUDED.competitor_1,
          competitor_2 = EXCLUDED.competitor_2,
          competitor_3 = EXCLUDED.competitor_3
    `;

    await pool.query(insertQuery, [
      businessId,
      comp1 ? JSON.stringify(comp1) : null,
      comp2 ? JSON.stringify(comp2) : null,
      comp3 ? JSON.stringify(comp3) : null,
    ]);
  }

  return formattedResults;
};

const getMapData = async (userId, competitorsResults = {}) => {
  if (!competitorsResults || typeof competitorsResults !== "object") {
    competitorsResults = {};
  }

  // Step 1: Get latest searched business IDs
  const searchQuery = `
    SELECT business_ids 
    FROM user_searched_businesses 
    WHERE user_id = $1 
    ORDER BY search_date DESC 
    LIMIT 1;
  `;
  const searchResult = await pool.query(searchQuery, [userId]);

  if (searchResult.rows.length === 0) return null;

  const searchedBusinessIds = searchResult.rows[0].business_ids;
  if (!Array.isArray(searchedBusinessIds) || searchedBusinessIds.length === 0)
    return null;

  // Step 2: Fetch names & locations of searched businesses
  const businessQuery = `
    SELECT businessid, name, location 
    FROM businesses 
    WHERE businessid = ANY($1);
  `;
  const businessResult = await pool.query(businessQuery, [searchedBusinessIds]);

  if (businessResult.rows.length === 0) return null;

  // Step 3: Format the map data
  const mapData = {
    businesses: businessResult.rows.map((business) => ({
      id: business.businessid,
      name: business.name,
      location: business.location,
      competitors: (competitorsResults[business.businessid] || []).map((c) => ({
        id: c.businessid,
        name: c.name,
        location: c.location,
        distance: c.distance_km ? `${c.distance_km} km` : "Unknown",
      })),
    })),
  };
  return mapData;
};

// insert and update businesses table data
const upsertBusinesses = async (businesses, keyword) => {
  const results = [];

  // Function to match businesses from different platforms
  const matchBusiness = (existing, incoming) => {
    return (
      (existing.phonenumbers && existing.phonenumbers === incoming.phone) ||
      (existing.website && existing.website === incoming.website) ||
      (existing.name === incoming.name &&
        existing.location.lat === incoming.location.lat &&
        existing.location.lng === incoming.location.lng)
    );
  };

  for (const b of businesses) {
    // Check for matching business from different platforms
    const matchQuery = `SELECT * FROM businesses;`;
    const matchResult = await pool.query(matchQuery);

    let matchedBusiness = matchResult.rows.find((existing) =>
      matchBusiness(existing, b)
    );

    if (matchedBusiness) {
      // Check if the matched business exists in the database
      const existingQuery = `
        SELECT * FROM businesses
        WHERE businessid = $1;
      `;
      const existingResult = await pool.query(existingQuery, [
        matchedBusiness.businessid,
      ]);

      if (existingResult.rows.length > 0) {
        // Merge existing data with new data
        const existing = existingResult.rows[0];
        const updatedData = {
          name: existing.name || b.name,
          address: existing.address || b.address,
          phonenumbers: existing.phonenumbers || b.phone,
          profileurl: existing.profileurl || b.profileurl,
          website: existing.website || b.website,
          category: existing.category || b.category,
          location: existing.location || b.location,
          rating: Math.max(existing.rating || 0, b.rating || 0),
          reviewscount: Math.max(
            existing.reviewscount || 0,
            b.reviewscount || 0
          ),
          status:
            existing.status === "closed" && b.status === "open"
              ? "open"
              : existing.status || b.status,
          niche: existing.niche || keyword,
          opening_hours: existing.opening_hours || b.opening_hours,
          reviews: existing.reviews || b.reviews,
        };

        // Update business if data is improved
        const updateQuery = `
          UPDATE businesses SET 
            address = $1, phonenumbers = $2, profileurl = $3, website = $4,
            category = $5, location = $6, rating = $7, reviewscount = $8, 
            status = $9, niche = $10, opening_hours = $11, reviews = $12
          WHERE businessid = $13 RETURNING *;
        `;
        const updatedResult = await pool.query(updateQuery, [
          updatedData.address,
          updatedData.phonenumbers,
          updatedData.profileurl,
          updatedData.website,
          updatedData.category,
          updatedData.location,
          updatedData.rating,
          updatedData.reviewscount,
          updatedData.status,
          updatedData.niche,
          JSON.stringify(updatedData.opening_hours),
          JSON.stringify(updatedData.reviews),
          // updatedData.opening_hours,
          // updatedData.reviews,
          existing.businessid,
        ]);
        if (updatedResult.rows.length > 0) {
          results.push(updatedResult.rows[0]);
        } else {
          console.log(`Update failed for business ID: ${existing.businessid}`);
        }
      }
    } else {
      // Generate new business ID using the sequence
      const idQuery = `SELECT nextval('business_id_seq') AS id;`;
      const idResult = await pool.query(idQuery);
      const newBusinessId = `Biz-${idResult.rows[0].id}`;
      // Insert new business
      const insertQuery = `
        INSERT INTO businesses (
          businessid, name, address, phonenumbers, profileurl, website,
          category, location, rating, reviewscount, status, niche, opening_hours, reviews
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *;
      `;
      const insertResult = await pool.query(insertQuery, [
        newBusinessId,
        b.name,
        b.address,
        b.phonenumbers,
        b.profileurl,
        b.website,
        b.category,
        b.location,
        b.rating,
        b.reviewscount,
        b.status,
        keyword,
        JSON.stringify(b.opening_hours),
        JSON.stringify(b.reviews),
        //  b.opening_hours,
        //  b.reviews,
      ]);
      if (insertResult.rows.length > 0) {
        results.push(insertResult.rows[0]);
      }
      results.push(insertResult.rows[0]?.businessid || "INSERT_FAILED");
    }
  }
  return results;
};

const insertUserSearch = async (userId, keyword, location, businessIds) => {
  if (!Array.isArray(businessIds)) {
    throw new Error("Business IDs must be an array.");
  }

  if (businessIds.length === 0) {
    console.error("businessIds is empty.");
    throw new Error("Business IDs array cannot be empty.");
  }

  // Normalize business IDs
  if (typeof businessIds[0] === "object") {
    businessIds = businessIds
      .map((b) => b?.businessid)
      .filter((id) => id !== undefined);
  }

  businessIds = businessIds.map((id) => String(id));
  console.log("Final businessIds for insertion:", businessIds);

  // Get the latest user search entry
  const checkQuery = `
  SELECT *
  FROM user_searched_businesses
  WHERE user_id = $1
  AND query_keyword = $2
  AND location = $3
  ORDER BY search_date DESC
  LIMIT 1;
`;
  const checkResult = await pool.query(checkQuery, [userId, keyword, location]);

  if (checkResult.rows.length > 0) {
    const latestRow = checkResult.rows[0];
    console.log("Latest user_searched_businesses row found:", latestRow);

    if (
      latestRow.query_keyword === keyword &&
      latestRow.location === location
    ) {
      console.log(
        "Query keyword and location match with latest entry. Checking business_ids count."
      );

      const existingBusinessIds = latestRow.business_ids || [];
      console.log("Existing business_ids in row:", existingBusinessIds);

      if (existingBusinessIds.length === 1) {
        console.log(
          "Only one business ID in existing business_ids. Appending new business IDs."
        );

        // Merge existing with incoming businessIds (no deduplication unless needed)
        const updatedBusinessIds = [...existingBusinessIds, ...businessIds];

        const updateQuery = `
          UPDATE user_searched_businesses
          SET business_ids = $1::jsonb,
              search_date = NOW()
          WHERE search_id = $2
          RETURNING *;
        `;

        const updateResult = await pool.query(updateQuery, [
          JSON.stringify(updatedBusinessIds),
          latestRow.search_id,
        ]);

        console.log("Business IDs updated in existing row.");
        return updateResult.rows[0];
      } else {
        console.log(
          "Existing business_ids has more than one ID. Inserting new row."
        );
      }
    } else {
      console.log(
        "Query keyword or location did not match. Inserting new row."
      );
    }
  } else {
    console.log("No existing user search rows found. Inserting new row.");
  }

  // Insert new row if conditions above not met
  const insertQuery = `
    INSERT INTO user_searched_businesses 
    (user_id, query_keyword, location, business_ids, search_date)
    VALUES ($1, $2, $3, $4::jsonb, NOW())
    RETURNING *;
  `;
  const insertResult = await pool.query(insertQuery, [
    userId,
    keyword,
    location,
    JSON.stringify(businessIds),
  ]);

  console.log("New user search entry inserted.");
  return insertResult.rows[0];
};

module.exports = {
  getAllBusinesses,
  getBusinessDetailsLegacy,
  mapdataLegacy,
  getCompetitorsByDistance,
  getMapData,
  upsertBusinesses,
  insertUserSearch,
  getCompetitorDetailsLegacy,
};
