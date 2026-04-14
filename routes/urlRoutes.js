const express = require("express");
const router = express.Router();

const {
  shortenUrl,
  createUrl,
  redirectUrl,
  getUrls,
  shareUrl
} = require("../controllers/urlController");

const auth = require("../middleware/authMiddleware");

// PUBLIC
router.post("/shorten", shortenUrl);

// PROTECTED
router.post("/create", auth, createUrl);
router.get("/my", auth, getUrls);
router.post("/share", auth, shareUrl);

router.get("/:shortId", redirectUrl);

module.exports = router;