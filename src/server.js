const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/user-route");
const authRoutes = require("./routes/auth-route");
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
