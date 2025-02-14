const express = require("express");
const { registerUser } = require("../controllers/userController"); // Ensure correct import

const router = express.Router();

router.post("/register", registerUser);
// router.post("/login", loginUser);

module.exports = router;
