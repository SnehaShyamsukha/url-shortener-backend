const shortid = require("shortid");
const Url = require("../models/Url");
const validUrl = require("valid-url");

// CREATE URL
exports.createUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ msg: "URL is required" });
    }

    //  VALIDATE
    if (!validUrl.isUri(originalUrl)) {
      return res.status(400).json({ msg: "Invalid URL" });
    }

    // PREVENT DUPLICATE
    let existing = await Url.findOne({ originalUrl, user: req.user.id });

    if (existing) {
      return res.json({
        shortUrl: `${process.env.BASE_URL}/api/url/${existing.shortId}`,
        _id: existing._id,
        clicks: existing.clicks
      });
    }

    const shortId = shortid.generate();

    const newUrl = await Url.create({
      originalUrl,
      shortId,
      user: req.user.id
    });

    res.json({
      shortUrl: `${process.env.BASE_URL}/api/url/${shortId}`,
      _id: newUrl._id,
      clicks: 0
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// REDIRECT + TRACK
exports.redirectUrl = async (req, res) => {
  try {
    const url = await Url.findOne({ shortId: req.params.shortId });

    if (!url) return res.status(404).send("Not found");

    // TRACK
    url.clicks += 1;
    url.analytics.push({
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });

    await url.save();

    res.redirect(url.originalUrl);

  } catch (err) {
    res.status(500).send("Error");
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