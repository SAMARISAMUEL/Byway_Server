// Bring down packages installed
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const errorHandler = require("./middleware/errorHandler");
const rateLimit = require("express-rate-limit");
// initialize a express app
const app = express();

// Configure middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3002", // Restrict CORS
    credentials: true,
  })
);
// - ensure that express can read json
app.use(express.json());
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 3 requests per windowMs
  message: "Too many requests, please try again later.",
});
app.use("/api/auth", authLimiter);

app.use("/api/auth", authRoutes);
app.use(errorHandler);

const url = process.env.MONGODB_URL;

const options = {
  serverSelectionTimeoutMS: 30000, // BufferMS
};

//Mongo db connection
mongoose
  .connect(url, options)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Mongo Db Error:", error);
  });

// start node js server
const PORT = process.env.PORT || 0;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
