const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortId: String,

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  // TEAM SHARING
  sharedWith: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  clicks: { type: Number, default: 0 },

  analytics: [
    {
      ip: String,
      userAgent: String,
      date: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("Url", urlSchema);