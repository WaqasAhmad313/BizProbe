const express = require("express");
const router = express.Router();
const businessController = require("../controllers/businessController");
const authenticateUser = require("../middleware/authMiddleware");

router.post(
  "/search",
  authenticateUser,
  businessController.searchAndPrepareBusinessesController
);
router.get(
  "/business/:businessId/details",
  authenticateUser,
  businessController.getBusinessDetailsWithCompetitorsController
);
router.get(
  "/status/:businessId",
  authenticateUser,
  businessController.getScrapeStatus
);

module.exports = router;
