const {
  createTemplate,
  getTemplatesByUser,
  deleteTemplate,
} = require("../models/dashTemplateModel");

const createTemplateService = async (templateName, content, userId) => {
  try {
    if (!templateName || !content || !userId) {
      throw new Error(
        "All fields (templateName, subject, content, userId) are required."
      );
    }

    const template = await createTemplate(templateName, content, userId);
    return template;
  } catch (error) {
    console.error("[TemplateService] Error in createTemplateService:", error);
    throw error;
  }
};

const getTemplatesByUserService = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required to fetch templates.");
    }

    const templates = await getTemplatesByUser(userId);
    return templates;
  } catch (error) {
    console.error(
      "[TemplateService] Error in getTemplatesByUserService:",
      error
    );
    throw error;
  }
};

const deleteTemplateService = async (userId, templateId) => {
  try {
    if (!userId || !templateId) {
      throw new Error(
        "Both templateId and userId are required to delete a template."
      );
    }
    console.log("Template Id in service", templateId);
    console.log("UserId in services", userId);
    const deletedTemplate = await deleteTemplate(templateId, userId);
    return deletedTemplate;
  } catch (error) {
    console.error("[TemplateService] Error in deleteTemplateService:", error);
    throw error;
  }
};

module.exports = {
  createTemplateService,
  getTemplatesByUserService,
  deleteTemplateService,
};
