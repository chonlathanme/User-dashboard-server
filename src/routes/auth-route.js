const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth-controller");
const authenticateToken = require('../middleware/authenticateToken');

router.post("/google-login", authController.loginGoogle);
router.get("/check", authenticateToken, authController.checkAuth);

module.exports = router;
