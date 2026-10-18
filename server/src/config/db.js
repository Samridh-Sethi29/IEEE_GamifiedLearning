const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/skillverse";
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Failed to connect: ${error.message}`);
    // Don't kill process immediately in dev so health check and offline-mode can be verified
  }
};

module.exports = connectDB;
