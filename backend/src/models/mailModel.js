const pool = require("../db");

const getBusinessEmail = async (businessId) => {
  try {
    const result = await pool.query(
      "SELECT email FROM business_info WHERE business_id = $1",
      [businessId]
    );
    return result.rows[0]?.email || null;
  } catch (error) {
    console.error("Error fetching business email:", error);
    throw error;
  }
};

const getUserEmail = async (userId) => {
  try {
    const result = await pool.query(
      "SELECT id, email FROM gmail_accounts WHERE user_id = $1",
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching user email:", error);
    throw error;
  }
};

const getUserTemplates = async (userId) => {
  try {
    const result = await pool.query(
      "SELECT template_id, template_name FROM templates WHERE created_by = $1",
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching user templates:", error);
    throw error;
  }
};

//  Get full template by ID
const getTemplateById = async (templateId) => {
  try {
    const result = await pool.query(
      "SELECT content FROM templates WHERE template_id = $1",
      [templateId]
    );
    return result.rows[0]?.content || null;
  } catch (error) {
    console.error("Error fetching template by ID:", error);
    throw error;
  }
};

const getPlaceholderDescriptions = async (placeholders) => {
  try {
    const result = await pool.query(
      `SELECT key, description FROM placeholders WHERE key = ANY($1)`,
      [placeholders]
    );

    const descriptions = {};
    result.rows.forEach((row) => {
      descriptions[row.key] = row.description;
    });

    return descriptions;
  } catch (error) {
    console.error("Error fetching placeholder descriptions:", error);
    throw error;
  }
};

const getBusinessDataByPlaceholders = async (businessId, placeholders) => {
  try {
    console.log("▶️ Fetching business data for businessId:", businessId);
    console.log("▶️ Requested placeholders:", placeholders);

    // Fetch placeholder mapping for requested placeholders
    const mappingResult = await pool.query(
      `SELECT * FROM placeholders WHERE LOWER(key) = ANY($1::text[])`,
      [placeholders.map((ph) => ph.toLowerCase())]
    );

    console.log("✅ Fetched placeholder mappings:", mappingResult.rows);

    if (mappingResult.rowCount === 0) {
      console.warn("⚠️ No matching placeholders found.");
      return null;
    }

    const mappings = mappingResult.rows;
    const data = {};

    for (const mapping of mappings) {
      const {
        key,
        source_table,
        source_column,
        json_key,
        value_from_related_table,
        related_table,
        related_column,
      } = mapping;

      console.log(`\n Processing key: ${key}`);
      console.log("Mapping details:", mapping);

      let value;

      if (!value_from_related_table) {
        if (json_key) {
          console.log(
            `Fetching JSONB key '${json_key}' from ${source_table}.${source_column}`
          );

          const result = await pool.query(
            `SELECT ${source_column} ->> $1 AS value FROM ${source_table} WHERE business_id = $2`,
            [json_key, businessId]
          );
          value = result.rows[0]?.value || null;
        } else {
          console.log(
            `Fetching direct column '${source_column}' from ${source_table}`
          );

          const result = await pool.query(
            `SELECT ${source_column} AS value FROM ${source_table} WHERE businessid = $1`,
            [businessId]
          );

          console.log("Direct query result:", result.rows[0]);
          value = result.rows[0]?.value || null;
        }
      } else {
        console.log(
          `Fetching related businessId from ${source_table}.${source_column} -> '${json_key}'`
        );

        const competitorResult = await pool.query(
          `SELECT ${source_column} ->> $1 AS related_business_id FROM ${source_table} WHERE business_id = $2`,
          [json_key, businessId]
        );

        const relatedBusinessId = competitorResult.rows[0]?.related_business_id;
        if (relatedBusinessId) {
          const relatedResult = await pool.query(
            `SELECT ${related_column} AS value FROM ${related_table} WHERE business_id = $1`,
            [relatedBusinessId]
          );
          value = relatedResult.rows[0]?.value || null;
        } else {
          console.warn("No related businessId found, setting value as null.");
          value = null;
        }
      }
      data[key] = value;
    }
    return data;
  } catch (error) {
    console.error("Error fetching business data by placeholders:", error);
    throw error;
  }
};

async function getUserTokens(userMail) {
  const query = `
    SELECT access_token, refresh_token 
    FROM gmail_accounts
    WHERE email = $1 AND is_active = true
  `;

  const { rows } = await pool.query(query, [userMail]);

  if (rows.length === 0) {
    throw new Error("No active tokens found for this user email.");
  }

  return rows[0];
}

async function insertOutreachLog({ userId, businessId, templateId, userMail }) {
  const query = `
    INSERT INTO outreach_log (user_id, business_id, template_used, date, email_used)
    VALUES ($1, $2, $3, NOW(), $4)
    RETURNING outreach_id;
  `;

  const { rows } = await pool.query(query, [
    userId,
    businessId,
    templateId,
    userMail,
  ]);
  return rows[0];
}

const insertFollowUp = async ({ userId, businessId, outreachId }) => {
  const query = `
    INSERT INTO follow_ups (user_id, business_id, outreach_id, status)
    VALUES ($1, $2, $3, 'Pending')
    RETURNING follow_up_id;
  `;
  const { rows } = await pool.query(query, [userId, businessId, outreachId]);
  return rows[0];
};

module.exports = {
  getBusinessEmail,
  getUserEmail,
  getUserTemplates,
  getTemplateById,
  getPlaceholderDescriptions,
  getBusinessDataByPlaceholders,
  getUserTokens,
  insertOutreachLog,
  insertFollowUp,
};
