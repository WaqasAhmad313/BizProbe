const pool = require("../db");
require("dotenv").config();
const getCoordinatesFromAddress = require("../utils/coordinates");

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const insertBusinessWithInfo = async (userId, data) => {
  const {
    name,
    address,
    phonenumbers,
    website,
    category,
    niche,
    email,
    social_media,
  } = data;

  // 1. Generate new businessid
  const idQuery = `SELECT nextval('business_id_seq') AS id;`;
  const idResult = await pool.query(idQuery);
  const newBusinessId = `Biz-${idResult.rows[0].id}`;

  // 2. Insert into businesses table
  const insertBusinessQuery = `
    INSERT INTO businesses (
      businessid, name, address, phonenumbers, website,
      category, niche
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7
    );
  `;

  const businessValues = [
    newBusinessId,
    name,
    address,
    phonenumbers,
    website || null,
    category,
    niche,
  ];

  await pool.query(insertBusinessQuery, businessValues);

  // 3. Insert into business_info table
  const insertInfoQuery = `
INSERT INTO business_info (
  business_id, email, social_media, website
) VALUES (
  $1, $2, $3, $4
);
`;

  const infoValues = [
    newBusinessId,
    JSON.stringify(email),
    JSON.stringify(social_media),
    website,
  ];

  await pool.query(insertInfoQuery, infoValues);

  // 4. Insert into user_searched_businesses table
  const insertUserQuery = `
    INSERT INTO user_searched_businesses (
      user_id, search_date, query_keyword, location, business_ids
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const now = new Date().toISOString();
  console.log("Business Id for user_searched_table:", newBusinessId);
  const businessIdsArray = [newBusinessId];

  const userValues = [
    userId,
    now,
    niche,
    address,
    JSON.stringify(businessIdsArray),
  ];

  const userInsertResult = await pool.query(insertUserQuery, userValues);

  const coordinates = await getCoordinatesFromAddress(address);

  if (!coordinates) {
    console.error(`Failed to geocode location for: ${name}`);
  } else {
    const locationJson = JSON.stringify({
      lat: coordinates.lat,
      lng: coordinates.lng,
    });

    const updateLocationQuery = `
      UPDATE businesses
      SET location = $1
      WHERE businessid = $2;
    `;

    await pool.query(updateLocationQuery, [locationJson, newBusinessId]);
  }

  return {
    businessid: newBusinessId,
    userSearchEntry: userInsertResult.rows[0],
    coordinates,
  };
};

module.exports = {
  insertBusinessWithInfo,
};
