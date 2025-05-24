const {
  fetchOutreachDataService,
  generateTemplateDataForBusinessService,
  sendOutreachEmailService,
} = require("../services/mailService");

async function getOutreachDataController(req, res) {
  const userId = req.user?.userId;
  const { businessId } = req.query;

  if (!userId || !businessId) {
    return res.status(400).json({ error: "Missing userId or businessId" });
  }

  try {
    const outreachData = await fetchOutreachDataService(userId, businessId);
    return res.status(200).json(outreachData);
  } catch (error) {
    console.error("Controller error:", error);
    return res.status(500).json({ error: "Failed to fetch outreach data" });
  }
}

const generateTemplateDataController = async (req, res) => {
  const { templateId, businessId } = req.params;
  const { generateEmail } = req.query;

  try {
    if (!templateId || !businessId) {
      return res.status(400).json({
        success: false,
        message: "Both templateId and businessId are required.",
      });
    }

    const result = await generateTemplateDataForBusinessService(
      templateId,
      businessId,
      generateEmail === "true"
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in generateTemplateDataController:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while generating template data.",
      error: error.message,
    });
  }
};

async function sendOutreachEmailController(req, res) {
  try {
    const {
      businessId,
      businessMail,
      templateId,
      userMail,
      subject,
      emailHTML,
    } = req.body;

    const userId = req.user?.userId;
    if (
      !businessId ||
      !businessMail ||
      !templateId ||
      !userMail ||
      !subject ||
      !emailHTML
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    // Call service
    const result = await sendOutreachEmailService({
      userId,
      businessId,
      businessMail,
      templateId,
      userMail,
      subject,
      emailHTML,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in sendOutreachEmailController:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getOutreachDataController,
  generateTemplateDataController,
  sendOutreachEmailController,
};
