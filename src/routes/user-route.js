const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");
const authController = require("../controllers/auth-controller");
const authMiddleware = require("../middleware/authenticateToken");

router.get('/get-users', authMiddleware, userController.getUserData);
router.post("/create-users", userController.createUserData);

module.exports = router;