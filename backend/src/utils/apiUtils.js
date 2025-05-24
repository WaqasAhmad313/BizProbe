const pool = require("../db");
const axios = require("axios");
const { v4: uuid4 } = require("uuid");
const { getResponseDetails } = require("../utils/apiResponseMapper");
require("dotenv").config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const logApiUsage = async (
  userId,
  apiName,
  endpoint,
  requestParams,
  responseCode,
  responseTime
) => {
  try {
    const responseDetails = getResponseDetails(responseCode);
    const status = responseDetails.status;
    const message = responseDetails.message;
    const apiUsageId = uuid4();

    const query = `
      INSERT INTO api_usage_logs (
        api_usage_id, user_id, api_name, endpoint, request_parameters, 
        response_status, response_code, response_message, response_time, request_timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW());
    `;

    const values = [
      apiUsageId,
      userId,
      apiName,
      endpoint,
      JSON.stringify(requestParams || {}),
      status,
      responseCode,
      message,
      responseTime,
    ];

    await pool.query(query, values);
  } catch (error) {
    console.error("Error logging API usage:", error);
  }
};

async function makeApiRequest(apiName, endpoint, params, req) {
  const userId = req.user.userId;
  const startTime = Date.now();
  let responseCode = null;
  let responseData = null;

  try {
    console.log(`Calling ${apiName} API:`, endpoint, "Params:", params);
    const response = await axios.get(endpoint, { params });
    responseCode = response.status;
    responseData = response.data;
    console.log(`${apiName} API Response:`, responseData);
  } catch (error) {
    responseCode = error.response ? error.response.status : 500;
    console.error(
      `${apiName} API Error:`,
      error.response?.data || error.message
    );
  }

  const responseTime = Date.now() - startTime;
  await logApiUsage(
    userId,
    apiName,
    endpoint,
    params,
    responseCode,
    responseTime
  );
  return responseData;
}

const fetchBusinesses = async (req, keyword, location, radius) => {
  let coordinates = location;

  if (typeof location === "string") {
    const geoData = await makeApiRequest(
      "Google Geocoding",
      "https://maps.gomaps.pro/maps/api/geocode/json",
      { address: location, key: GOOGLE_MAPS_API_KEY },
      req
    );
    coordinates = geoData?.results?.[0]?.geometry?.location || null;
    if (!coordinates) {
      console.error("Failed to fetch coordinates.");
      return [];
    }
  }

  const googleNearby = await makeApiRequest(
    "Google Places Nearby Search",
    "https://maps.gomaps.pro/maps/api/place/nearbysearch/json",
    {
      keyword,
      location: `${coordinates.lat},${coordinates.lng}`,
      radius,
      key: GOOGLE_MAPS_API_KEY,
    },
    req
  );

  if (!googleNearby || !googleNearby.results) {
    console.error(
      "Google API response is invalid or missing 'results'.",
      googleNearby
    );
    return [];
  }

  const googleDetailsPromises = googleNearby.results.map((b) =>
    makeApiRequest(
      "Google Place Details",
      "https://maps.gomaps.pro/maps/api/place/details/json",
      {
        place_id: b.place_id,
        key: GOOGLE_MAPS_API_KEY,
        fields:
          "name,formatted_address,international_phone_number,website,opening_hours,reviews,geometry,place_id,rating,user_ratings_total,types",
      },
      req
    )
  );

  const googleDetailsResults = await Promise.allSettled(googleDetailsPromises);

  const results = googleNearby.results.map((b, index) => {
    const details =
      googleDetailsResults[index].status === "fulfilled"
        ? googleDetailsResults[index].value?.result
        : {};

    return {
      name: b.name,
      address: details?.formatted_address || b.vicinity || "Unknown",
      phonenumbers: details?.international_phone_number || null,
      website: details?.website || null,
      category: b.types?.[0] || "Unknown",
      location: b.geometry?.location || null,
      rating: b.rating || 0,
      reviewscount: b.user_ratings_total || 0,
      status: b.business_status === "OPERATIONAL" ? "open" : "closed",
      niche: keyword,
      profileurl: `https://www.google.com/maps/place/?q=place_id:${b.place_id}`,
      opening_hours: details?.opening_hours?.weekday_text || null,
      reviews: details?.reviews
        ? details.reviews.slice(0, 3).map((r) => ({
            author_name: r.author_name,
            rating: r.rating,
            text: r.text,
            time: r.relative_time_description,
          }))
        : [],
    };
  });
  return results;
};

module.exports = { fetchBusinesses };
