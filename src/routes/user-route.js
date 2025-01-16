const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");
const authenticateToken = require('../middleware/authenticateToken');

// Protected routes
router.get("/get-users", authenticateToken, userController.getUsers);
router.post("/create-users", authenticateToken, userController.createUserData);

module.exports = router;