const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth-controller");
const authenticateToken = require('../middleware/authenticateToken');

// Public routes
router.post("/google-login", authController.loginGoogle);

// Protected routes
router.get("/check", authenticateToken, authController.checkAuth);

module.exports = router;
