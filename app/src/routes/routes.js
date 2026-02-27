const express = require("express");
const router = express.Router();
const authcontroller = require("../controllers/auth-controllers");

router.get("/", (req, res) => {
  res.json({ message: "Hello World from Task Manager API!" });
});

router.get("/register", authcontroller.register);
router.post("/login", authcontroller.login); // change

module.exports = router;
