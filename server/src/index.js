const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env if present
dotenv.config({ path: path.join(__dirname, "../.env") });

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const saveRoutes = require("./routes/save");
const healthRoutes = require("./routes/health");
const achievementRoutes = require("./routes/achievements");

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers
app.use(helmet());

// CORS configuration - supports single or comma-separated origins
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const allowedOrigins = clientOrigin.split(",").map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(new Error(`Origin '${origin}' not allowed by CORS policy`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Payload size limit to prevent abuse / memory DOS
app.use(express.json({ limit: "500kb" }));
app.use(express.urlencoded({ extended: true, limit: "500kb" }));

// Route Mounts
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/save", saveRoutes);
app.use("/api/achievements", achievementRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found." });
});

// Central Error Handler
app.use((err, req, res, next) => {
  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({ error: err.message });
  }
  console.error("[Unhandled Server Error]:", err);
  res.status(500).json({ error: "An unexpected internal server error occurred." });
});

// Connect to MongoDB and listen
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[SkillVerse Server] Running on http://localhost:${PORT}`);
    console.log(`[SkillVerse Server] Allowed Origins: ${allowedOrigins.join(", ")}`);
  });
});

module.exports = app;
