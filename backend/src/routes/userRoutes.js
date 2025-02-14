const express = require("express");
const { registerUser } = require("../controllers/userController");
const { verifyEmail } = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.get("/verify-email", verifyEmail);

// router.post("/login", loginUser);

module.exports = router;
