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
    origin: process.env.FRONTEND_URL || "http://localhost:3002", // Restrict CORS //
    credentials: true,
  })
);
// - ensure that express can read json
app.use(express.json());
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
});
app.use("/api/auth", authLimiter);

app.use("/api/auth", authRoutes);
app.use(errorHandler);

// MongoDB connection URL

// we can also validate this
// Validate environment variables to ensure that it is available before use
// if (!process.env.MONGODB_URL) {
//   console.error("MONGODB_URL is not defined. Check your .env file.");
//   process.exit(1);
// }

const url = process.env.MONGODB_URL;

const options = {
  serverSelectionTimeoutMS: 30000, // BufferMS
  connectTimeoutMS: 5000,
};

//the code up here from line 33 -> 36 IS actually a fallback so If MongoDB is unreachable (wrong URL, firewall issues), now the issue is that the app will hang for 30 seconds before failing. Better alternative might be to increase retry attempts instead of just waiting. or better still ignore the code in it's entirety

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
const PORT = process.env.PORT || 0; // When PORT = 0, Node.js will assign a random available port. This makes it hard to know which port your server is running on. So please use 5000 or 8000 or 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
