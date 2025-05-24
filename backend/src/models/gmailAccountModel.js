const pool = require("../db");

// Insert or update Gmail account (upsert)
async function upsertGmailAccount({
  userId,
  email,
  access_token,
  refresh_token,
  name,
  picture,
}) {
  const query = `
    INSERT INTO gmail_accounts (user_id, email, access_token, refresh_token, name, picture)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (user_id, email)
    DO UPDATE SET
      access_token = EXCLUDED.access_token,
      refresh_token = EXCLUDED.refresh_token,
      name = EXCLUDED.name,
      picture = EXCLUDED.picture,
      is_active = true
    RETURNING *;
  `;
  const values = [userId, email, access_token, refresh_token, name, picture];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getUserDashboardStats(userId) {
  // Query 1 — User general info + counts
  const userInfoResult = await pool.query(
    `
    SELECT 
      u.name,
      u.email,
      (SELECT COUNT(*) FROM gmail_accounts WHERE user_id = u.userid AND is_active = true) AS total_gmail_accounts,
      (SELECT COUNT(*) FROM outreach_log WHERE user_id = u.userid) AS total_outreach_done,
      (SELECT COUNT(*) FROM templates WHERE created_by = u.userid) AS total_templates_created
    FROM users u
    WHERE u.userid = $1;
    `,
    [userId]
  );

  // Query 2 — Gmail accounts + outreach count
  const gmailOutreachResult = await pool.query(
    `
    SELECT 
      g.email AS gmail_email,
      COALESCE(o.outreach_count, 0) AS outreach_count
    FROM gmail_accounts g
    LEFT JOIN (
      SELECT 
        email_used, 
        COUNT(*) AS outreach_count
      FROM outreach_log
      WHERE user_id = $1
      GROUP BY email_used
    ) o ON o.email_used = g.email
    WHERE g.user_id = $1 AND g.is_active = true;
    `,
    [userId]
  );

  // Query 3 — Businesses searched, niches searched, Gmail profile picture
  const businessStatsResult = await pool.query(
    `
    SELECT
      (
        SELECT COUNT(*) 
        FROM (
          SELECT jsonb_array_elements_text(business_ids) AS business_id
          FROM user_searched_businesses
          WHERE user_id = u.userid
        ) AS business_ids_count
      ) AS total_businesses_searched,
  
      (
        SELECT picture
        FROM gmail_accounts
        WHERE user_id = u.userid AND is_active = true AND picture IS NOT NULL
        LIMIT 1
      ) AS gmail_profile_picture,
  
      (
        SELECT json_agg(
          json_build_object(
            'niche', counts_per_niche.query_keyword,
            'business_count', counts_per_niche.business_count
          )
        )
        FROM (
          SELECT 
            us.query_keyword, 
            COUNT(b.business_id) AS business_count
          FROM user_searched_businesses us
          CROSS JOIN LATERAL jsonb_array_elements_text(us.business_ids) AS b(business_id)
          WHERE us.user_id = u.userid
          GROUP BY us.query_keyword
        ) AS counts_per_niche
      ) AS businesses_per_niche
  
    FROM users u
    WHERE u.userid = $1;
    `,
    [userId]
  );

  // Return all results together
  return {
    userInfo: userInfoResult.rows[0],
    businessStats: businessStatsResult.rows[0],
    gmailOutreach: gmailOutreachResult.rows,
  };
}

// Deactivate (soft delete) a Gmail account
async function deactivateGmailAccount(userId, email) {
  const result = await pool.query(
    `UPDATE gmail_accounts SET is_active = false WHERE user_id = $1 AND email = $2 RETURNING *`,
    [userId, email]
  );
  return result.rows[0];
}

// Get single Gmail account by email and user (e.g., before sending mail)
async function getGmailAccountByEmail(userId, email) {
  const result = await pool.query(
    `SELECT * FROM gmail_accounts WHERE user_id = $1 AND email = $2 AND is_active = true`,
    [userId, email]
  );
  return result.rows[0];
}

module.exports = {
  upsertGmailAccount,
  getUserDashboardStats,
  deactivateGmailAccount,
  getGmailAccountByEmail,
};
