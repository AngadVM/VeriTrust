const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});

router.post("/register", authController.onRegister);
router.post("/login", authController.onLogin);

module.exports = router;
