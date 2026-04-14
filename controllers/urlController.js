const shortid = require("shortid");
const Url = require("../models/Url");
const validUrl = require("valid-url");

// CREATE URL (AUTH)
exports.createUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ msg: "URL is required" });
    }

    if (!validUrl.isUri(originalUrl)) {
      return res.status(400).json({ msg: "Invalid URL" });
    }

    let existing = await Url.findOne({ originalUrl, user: req.user.id });

    if (existing) {
      return res.json({
        shortUrl: `${process.env.BASE_URL}/${existing.shortId}`,
        _id: existing._id,
        clicks: existing.clicks
      });
    }

    const shortId = shortid.generate();

    const newUrl = await Url.create({
      originalUrl,
      shortId,
      user: req.user.id,
      clicks: 0,
      analytics: []
    });

    res.json({
      shortUrl: `${process.env.BASE_URL}/${shortId}`,
      _id: newUrl._id,
      clicks: 0
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};


// PUBLIC SHORTEN (NO AUTH)
exports.shortenUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ msg: "URL is required" });
    }

    if (!validUrl.isUri(originalUrl)) {
      return res.status(400).json({ msg: "Invalid URL" });
    }

    const shortId = shortid.generate();

    const newUrl = await Url.create({
      originalUrl,
      shortId,
      clicks: 0,
      analytics: []
    });

    res.json({
      shortUrl: `${process.env.BASE_URL}/${shortId}`
    });

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};


// REDIRECT + TRACK
exports.redirectUrl = async (req, res) => {
  try {
    const { shortId } = req.params;

    const url = await Url.findOne({ shortId });

    if (!url) {
      return res.status(404).send("URL not found ❌");
    }

    url.clicks += 1;

    url.analytics.push({
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });

    await url.save();

    return res.redirect(url.originalUrl);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error ❌");
  }
};


// GET USER + SHARED URLS
exports.getUrls = async (req, res) => {
  try {
    const urls = await Url.find({
      $or: [
        { user: req.user.id },
        { sharedWith: req.user.id }
      ]
    });

    res.json(urls);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};


// SHARE URL
exports.shareUrl = async (req, res) => {
  try {
    const { urlId, userId } = req.body;

    const url = await Url.findById(urlId);

    if (!url) return res.status(404).json({ msg: "URL not found" });

    if (url.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not allowed" });
    }

    if (!url.sharedWith.includes(userId)) {
      url.sharedWith.push(userId);
      await url.save();
    }

    res.json({ msg: "Shared successfully" });

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};