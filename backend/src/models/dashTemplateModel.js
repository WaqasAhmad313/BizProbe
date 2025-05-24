const pool = require("../db");

const createTemplate = async (templateName, content, userId) => {
  const query = `
    INSERT INTO templates (template_name, content, created_by, created_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING *;
  `;
  const values = [templateName, JSON.stringify(content), userId];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getTemplatesByUser = async (userId) => {
  const query = `
    SELECT template_id, template_name,  content, created_at
    FROM templates
    WHERE created_by = $1
    ORDER BY created_at DESC;
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

const deleteTemplate = async (templateId, userId) => {
  const query = `
    DELETE FROM templates
    WHERE template_id = $1 AND created_by = $2
    RETURNING *;
  `;
  const values = [templateId, userId];
  const { rows } = await pool.query(query, values);

  if (rows.length === 0) {
    throw new Error(
      "Template not found or you do not have permission to delete it."
    );
  }

  return rows[0]; // Return the deleted template data if necessary
};

module.exports = {
  createTemplate,
  getTemplatesByUser,
  deleteTemplate,
};
