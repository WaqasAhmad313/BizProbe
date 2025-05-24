const express = require("express");
const router = express.Router();
const {
  getOutreachDataController,
  generateTemplateDataController,
  sendOutreachEmailController,
} = require("../controllers/mailController");
const authenticateUser = require("../middleware/authMiddleware");

// Route: GET outreach data (business email, user email, templates)
router.get("/outreach-data", authenticateUser, getOutreachDataController);
router.get(
  "/template/:templateId/business/:businessId",
  generateTemplateDataController
);
router.post("/send-mail", authenticateUser, sendOutreachEmailController);

module.exports = router;
