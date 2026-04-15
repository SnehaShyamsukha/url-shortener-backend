require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const urlRoutes = require("./routes/urlRoutes");

const app = express();

// CORS
app.use(cors({
  origin: "https://url-shortener-frontend-khaki-zeta.vercel.app",
  credentials: true
}));

app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/url", urlRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));

// Start Server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});