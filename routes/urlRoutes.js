const express = require("express");
const router = express.Router();

const {
  createUrl,
  redirectUrl,
  getUrls,
  shareUrl
} = require("../controllers/urlController");

const auth = require("../middleware/authMiddleware");

router.post("/create", auth, createUrl);
router.get("/my", auth, getUrls);


router.post("/share", auth, shareUrl);


router.get("/:shortId", redirectUrl);

module.exports = router;