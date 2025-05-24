const express = require("express");
const router = express.Router();
const TemplateController = require("../controllers/dashTemplateController");
const authenticateUser = require("../middleware/authMiddleware");

router.post(
  "/templates",
  authenticateUser,
  TemplateController.createTemplateController
);

router.get(
  "/templates",
  authenticateUser,
  TemplateController.getUserTemplatesController
);

router.delete(
  "/templates/:templateId",
  authenticateUser,
  TemplateController.deleteTemplateController
);

module.exports = router;
