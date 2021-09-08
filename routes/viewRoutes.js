const express = require("express");
const router = express.Router();
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");

router.get("/", viewController.getHome);
router.get(
  "/api/v1/secret",
  authController.protect,
  authController.restrictTo("admin"),
  viewController.secretPage
);

module.exports = router;
