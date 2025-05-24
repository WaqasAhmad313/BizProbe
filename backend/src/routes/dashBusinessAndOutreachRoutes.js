const express = require("express");
const router = express.Router();
const dashBusinessAndOutreachController = require("../controllers/dashBusinessAndOutreachController");
const authenticateUser = require("../middleware/authMiddleware");

router.post(
  "/dashboard/add",
  authenticateUser,
  dashBusinessAndOutreachController.addBusinessController
);

router.post(
  "/dashboard/remove",
  authenticateUser,
  dashBusinessAndOutreachController.removeBusinessesFromDashboardController
);

router.get(
  "/dashboard",
  authenticateUser,
  dashBusinessAndOutreachController.getDashboardBusinessesController
);

router.get(
  "/outreach",
  authenticateUser,
  dashBusinessAndOutreachController.getOutreachBusinessesController
);

router.get(
  "/followup",
  authenticateUser,
  dashBusinessAndOutreachController.getUserFollowUpsController
);

module.exports = router;
