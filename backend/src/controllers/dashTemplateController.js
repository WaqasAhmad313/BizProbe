const {
  createTemplateService,
  deleteTemplateService,
  getTemplatesByUserService,
} = require("../services/dashTemplateService");

// Create a new template
const createTemplateController = async (req, res) => {
  try {
    const { templateName, content } = req.body;
    const userId = req.user?.userId;

    const newTemplate = await createTemplateService(
      templateName,
      content,
      userId
    );
    res.status(201).json({ success: true, data: newTemplate });
    console.log("Template Data in Controller:", newTemplate);
  } catch (error) {
    console.error("[TemplateController] createTemplateController:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a template
const deleteTemplateController = async (req, res) => {
  try {
    const { templateId } = req.params;
    const userId = req.user?.userId; // Extract userId from req.user (set by authentication middleware)

    if (!templateId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Template ID and user ID are required.",
      });
    }

    // Call the service to delete the template
    const deletedTemplate = await deleteTemplateService(userId, templateId);

    if (!deletedTemplate) {
      return res.status(404).json({
        success: false,
        message:
          "Template not found or you do not have permission to delete it.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Template deleted successfully",
      data: deletedTemplate,
    });
  } catch (error) {
    console.error("[TemplateController] deleteTemplateController:", error);
    res.status(500).json({
      success: false,
      message:
        error.message || "An error occurred while deleting the template.",
    });
  }
};

const getUserTemplatesController = async (req, res) => {
  try {
    const userId = req.user?.userId;

    const templates = await getTemplatesByUserService(userId);
    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    console.error("[TemplateController] getUserTemplatesController:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTemplateController,
  deleteTemplateController,
  getUserTemplatesController,
};
