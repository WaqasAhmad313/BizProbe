const axios = require("axios");
require("dotenv").config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const getCoordinatesFromAddress = async (address) => {
  try {
    const response = await axios.get(
      "https://maps.gomaps.pro/maps/api/geocode/json",
      {
        params: {
          address,
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );

    const coordinates = response.data?.results?.[0]?.geometry?.location || null;

    return coordinates;
  } catch (error) {
    console.error("Geocoding API error:", error.message);
    return null;
  }
};

module.exports = getCoordinatesFromAddress;
