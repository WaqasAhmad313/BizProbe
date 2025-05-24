const pool = require("../db");

async function getFilteredBusinesses(filters, userId) {
  const { niche, address, scraped, outreach } = filters;
  let conditions = [];
  let values = [];
  let i = 1;

  // Add userId as first parameter
  values.push(userId);
  const userIdIndex = i++;

  // WHERE conditions on businesses table
  if (niche) {
    conditions.push(`b.niche ILIKE $${i++}`);
    values.push(`%${niche}%`);
  }
  if (address) {
    conditions.push(`b.address ILIKE $${i++}`);
    values.push(`%${address}%`);
  }

  // Add scraped filter to SQL query - handle string representation
  if (scraped === "true" || scraped === true) {
    conditions.push(
      `(CASE WHEN bi.scraping_status = 'completed' THEN true ELSE false END) = $${i++}`
    );
    values.push(true);
  } else if (scraped === "false" || scraped === false) {
    conditions.push(
      `(CASE WHEN bi.scraping_status = 'completed' THEN true ELSE false END) = $${i++}`
    );
    values.push(false);
  }

  // Add outreach filter to SQL query - handle string representation
  // Note: using "outreach" instead of "outreach_sent" to match the actual parameter name
  if (outreach === "true" || outreach === true) {
    conditions.push(
      `(CASE WHEN ol.business_id IS NOT NULL THEN true ELSE false END) = $${i++}`
    );
    values.push(true);
  } else if (outreach === "false" || outreach === false) {
    conditions.push(
      `(CASE WHEN ol.business_id IS NOT NULL THEN true ELSE false END) = $${i++}`
    );
    values.push(false);
  }

  const whereClause = conditions.length
    ? `AND ${conditions.join(" AND ")}`
    : "";

  const query = `
    WITH earliest_search_dates AS (
      SELECT
        biz_id::text AS businessid,
        MIN(usb.search_date) AS search_date
      FROM user_searched_businesses usb,
           jsonb_array_elements_text(usb.business_ids) AS biz_id
      WHERE usb.user_id = $${userIdIndex}
      GROUP BY biz_id
    )
    SELECT 
      b.businessid,
      b.name,
      b.website,
      b.address,
      b.niche,
      esd.search_date,
      CASE 
        WHEN bi.scraping_status = 'completed' THEN true 
        ELSE false 
      END AS scraped,
      CASE 
        WHEN ol.business_id IS NOT NULL THEN true 
        ELSE false 
      END AS outreach_sent
    FROM businesses b
    LEFT JOIN earliest_search_dates esd ON esd.businessid = b.businessid
    LEFT JOIN business_info bi ON bi.business_id = b.businessid
    LEFT JOIN outreach_log ol ON ol.business_id = b.businessid
    WHERE esd.businessid IS NOT NULL
    ${whereClause}
    ORDER BY esd.search_date ASC;
  `;

  console.log("Values Data:", values);
  const result = await pool.query(query, values);
  const businesses = result.rows;

  return businesses;
}

async function removeBusinessFromDashboard(userId, businessId) {
  const query = `
      UPDATE user_searched_businesses
      SET business_ids = (
        SELECT jsonb_agg(value)
        FROM jsonb_array_elements_text(business_ids) AS elem(value)
        WHERE value != $2
      )
      WHERE user_id = $1
    `;

  const values = [userId, businessId];

  try {
    const result = await pool.query(query, values);
    return { success: true, rowCount: result.rowCount };
  } catch (error) {
    console.error("Error removing business from dashboard:", error);
    throw error;
  }
}

async function getAllUserBusinesses(userId) {
  const query = `
      WITH user_biz AS (
        SELECT 
          usb.user_id,
          biz_id::text AS businessid,
          MIN(usb.search_date) AS search_date
        FROM user_searched_businesses usb,
             jsonb_array_elements_text(usb.business_ids) AS biz_id
        WHERE usb.user_id = $1
        GROUP BY usb.user_id, biz_id
      )
      SELECT 
        b.businessid,
        b.name,
        b.website,
        b.address,
        b.niche,
        ub.search_date,
        CASE 
          WHEN bi.scraping_status = 'complete' THEN true 
          ELSE false 
        END AS scraped,
        CASE 
          WHEN ol.business_id IS NOT NULL THEN true 
          ELSE false 
        END AS outreach_sent
      FROM user_biz ub
      JOIN businesses b ON b.businessid = ub.businessid
      LEFT JOIN business_info bi ON bi.business_id = b.businessid
      LEFT JOIN outreach_log ol ON ol.business_id = b.businessid
      ORDER BY ub.search_date ASC;
    `;

  const result = await pool.query(query, [userId]);
  return result.rows;
}

const getBusinessesOutreachStatus = async (userId) => {
  try {
    const query = `
      SELECT 
        b.businessid,
        b.name,
        b.address,
        b.niche,
        b.website,
        bi.email,
        ol.date AS outreach_date,
        CASE
          WHEN ol.business_id IS NULL THEN 'Pending'
          ELSE 'Done'
        END AS outreach_status
      FROM businesses b
      LEFT JOIN outreach_log ol 
        ON ol.business_id = b.businessid AND ol.user_id = $1
      INNER JOIN business_info bi
        ON bi.business_id = b.businessid
      WHERE b.businessid IN (
        SELECT TRIM(BOTH '"' FROM business::text)
        FROM user_searched_businesses usb
        CROSS JOIN jsonb_array_elements(usb.business_ids) AS business
        WHERE usb.user_id = $1
      )
      AND bi.email IS NOT NULL 
      AND bi.email::text <> '""'
      ORDER BY CAST(SUBSTRING(b.businessid FROM '[0-9]+$') AS INTEGER);
    `;

    const { rows } = await pool.query(query, [userId]);
    return rows;
  } catch (error) {
    console.error(
      "[OutreachModel] Error in getBusinessesOutreachStatus:",
      error
    );
    throw error;
  }
};

const getFollowUpsForUser = async (userId) => {
  try {
    const query = `
      SELECT 
        f.follow_up_id,
        b.businessid,
        b.name AS business_name,
        o.date AS outreach_date,
        t.template_name,
        CASE 
          WHEN f.status = 'Done' THEN 'Done'
          WHEN NOW() - o.date < INTERVAL '3 days' THEN
            CONCAT(
              EXTRACT(DAY FROM (o.date + INTERVAL '3 days' - NOW())), ' day(s), ',
              EXTRACT(HOUR FROM (o.date + INTERVAL '3 days' - NOW())), ' hour(s)'
            )
          ELSE 'Pending'
        END AS follow_up_status
      FROM follow_ups f
      JOIN businesses b ON b.businessid = f.business_id
      JOIN outreach_log o ON o.outreach_id = f.outreach_id
      LEFT JOIN templates t ON t.template_id = o.template_used
      WHERE f.user_id = $1
      ORDER BY o.date DESC;
    `;

    const { rows } = await pool.query(query, [userId]);
    return rows;
  } catch (error) {
    console.error("[FollowUpModel] Error in getFollowUpsForUser:", error);
    throw error;
  }
};

module.exports = {
  getFilteredBusinesses,
  removeBusinessFromDashboard,
  getAllUserBusinesses,
  getBusinessesOutreachStatus,
  getFollowUpsForUser,
};
